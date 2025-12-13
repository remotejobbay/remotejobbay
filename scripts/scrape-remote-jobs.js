require('dotenv').config({ path: '../.env.local' });

const axios = require('axios');
const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// ===== CONFIGURATION =====
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ===== STRICT FILTER FOR "NO LOCATION SPECIFIC" JOBS =====
function isTrulyWorldwide(jobData) {
  const { tags = [], title = '', description = '' } = jobData;
  const allText = `${title} ${description} ${tags.join(' ')}`.toLowerCase();
  
  // POSITIVE: Must contain these "anywhere" keywords
  const worldwideKeywords = [
    'worldwide', 'global', 'anywhere', 'remote worldwide', 
    'worldwide remote', 'international', 'fully remote',
    'remote (global)', 'remote - worldwide', '100% remote',
    'world wide', 'any location', 'any country', 'anywhere in the world',
    'location independent', 'work from anywhere', 'globally remote'
  ];
  
  // NEGATIVE: Must NOT contain these restriction keywords
  const restrictionKeywords = [
    'usa only', 'us only', 'united states', 'america only',
    'north america', 'europe', 'european', 'uk only', 'germany',
    'emea', 'apac', 'latin america', 'canada only', 'australia',
    'asia', 'africa', 'specific country', 'timezone', 'gmt',
    'est', 'pst', 'cst', 'within', 'based in', 'resident of',
    'citizen of', 'authorized to work in', 'must be located in',
    'restricted to', 'only for', 'exclusively for'
  ];
  
  const hasWorldwideTerm = worldwideKeywords.some(keyword => allText.includes(keyword));
  const hasRestriction = restrictionKeywords.some(keyword => allText.includes(keyword));
  
  return hasWorldwideTerm && !hasRestriction;
}

// ===== GENERATE SLUG (matches your trigger function) =====
function generateSlug(title, company) {
  const baseSlug = `${title}-at-${company}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '')       // Trim hyphens from start/end
    .substring(0, 100);            // Limit length
  
  // Add timestamp to ensure uniqueness
  const timestamp = Date.now().toString().slice(-6);
  return `${baseSlug}-${timestamp}`;
}

// ===== DETERMINE JOB TYPE =====
function determineJobType(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  
  if (text.includes('part-time') || text.includes('part time')) {
    return 'Part-Time';
  } else if (text.includes('contract') || text.includes('freelance')) {
    return 'Contract';
  } else if (text.includes('intern') || text.includes('internship')) {
    return 'Internship';
  }
  return 'Full-Time'; // Default
}

// ===== EXTRACT SALARY (if available) =====
function extractSalary(description) {
  const text = description.toLowerCase();
  
  // Look for salary patterns like $80,000, $80k, 80k-120k
  const salaryPatterns = [
    /\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)k?\b/, // $80,000 or $80k
    /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)k?\s*(?:usd|dollars?)\b/i,
    /salary:\s*\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
    /\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*-\s*\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i
  ];
  
  for (const pattern of salaryPatterns) {
    const match = text.match(pattern);
    if (match) {
      // Take the first numeric value found
      let salaryStr = match[1].replace(/,/g, '');
      const salary = parseFloat(salaryStr);
      
      // If it's in thousands (like 80k), multiply
      if (match[0].toLowerCase().includes('k') && salary < 1000) {
        return salary * 1000;
      }
      return salary;
    }
  }
  
  return 0; // Default if no salary found
}

// ===== DETERMINE SALARY TYPE =====
function determineSalaryType(description, salary) {
  const text = description.toLowerCase();
  
  if (salary > 0) {
    return 'Fixed'; // If we extracted a number
  } else if (text.includes('negotiable') || text.includes('competitive')) {
    return 'Negotiable';
  } else if (text.includes('hourly') || text.includes('per hour')) {
    return 'Hourly';
  } else if (text.includes('commission') || text.includes('bonus')) {
    return 'Commission';
  }
  
  return 'Negotiable'; // Default as per your schema
}

// ===== GET COMPANY LOGO =====
function getCompanyLogoUrl(companyName) {
  // Clean company name for Clearbit URL
  const cleanName = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '') // Remove special chars
    .replace(/\s+/g, '')        // Remove spaces
    .substring(0, 30);          // Limit length
  
  if (!cleanName) return 'https://logo.clearbit.com/default.com';
  
  return `https://logo.clearbit.com/${cleanName}.com`;
}

// ===== MAIN SCRAPING FUNCTION =====
async function scrapeRemoteOk() {
  console.log('🚀 Starting scraper for worldwide remote jobs...');

  try {
    const { data } = await axios.get('https://remoteok.io/remote-dev-jobs', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    const $ = cheerio.load(data);
    const allJobs = [];
    const worldwideJobs = [];

    // Extract ALL jobs first
    $('tr.job').each((index, element) => {
      const title = $(element).find('.company h2').text().trim() || '';
      const company = $(element).find('.company h3').text().trim() || '';
      const tags = $(element).find('.tags .tag').map((i, el) => $(el).text().trim()).get();
      const applyUrl = $(element).find('.source a').attr('href');
      const fullApplyUrl = applyUrl ? 'https://remoteok.io' + applyUrl : null;

      // Get description from expanded view
      const descriptionEl = $(element).find('.description');
      const description = descriptionEl.length 
        ? descriptionEl.text().trim() 
        : `${title} at ${company}. Apply via ${fullApplyUrl}`;

      if (title && company && fullApplyUrl) {
        const jobData = {
          title,
          company,
          tags,
          description,
          applyUrl: fullApplyUrl,
        };
        
        allJobs.push(jobData);
        
        // Check if it's truly worldwide
        if (isTrulyWorldwide(jobData)) {
          const salary = extractSalary(description);
          const salaryType = determineSalaryType(description, salary);
          const jobType = determineJobType(title, description);
          const category = determineCategory(tags);
          const slug = generateSlug(title, company);
          
          worldwideJobs.push({
            // id: auto-generated by Supabase (bigint)
            // created_at: auto-generated by Supabase (timestamp)
            title: title,
            company: company,
            location: 'Worldwide', // Exactly matches your schema default
            type: jobType,
            category: category,
            salary: salary,
            salaryType: salaryType, // Must match your enum values
            logo: getCompanyLogoUrl(company),
            description: description.substring(0, 5000), // Limit length
            // user_id: null (not needed for scraped jobs)
            datePosted: new Date().toISOString(), // Must be timestamp with timezone
            applyUrl: fullApplyUrl,
            published: true, // Auto-publish scraped jobs
            // paymentref: null (for paid job posts)
            slug: slug,
            new: true, // Mark as new
            featured: Math.random() > 0.8 // Randomly feature some jobs (20%)
          });
        }
      }
    });

    console.log(`📊 Statistics:`);
    console.log(`   Total jobs found: ${allJobs.length}`);
    console.log(`   Worldwide/no-restriction jobs: ${worldwideJobs.length}`);
    console.log(`   Filtered out: ${allJobs.length - worldwideJobs.length} (location-specific)`);

    // Upload to Supabase
    if (worldwideJobs.length > 0) {
      console.log(`\n📤 Uploading ${worldwideJobs.length} jobs to Supabase...`);
      
      // Insert jobs one by one to handle slug conflicts
      let successCount = 0;
      let errorCount = 0;
      
      for (const job of worldwideJobs) {
        try {
          // Check if slug already exists
          const { data: existing } = await supabase
            .from('jobs')
            .select('slug')
            .eq('slug', job.slug)
            .single();
          
          if (existing) {
            // Regenerate slug if conflict exists
            job.slug = generateSlug(job.title, job.company + '-' + Date.now());
          }
          
          const { error } = await supabase
            .from('jobs')
            .insert([job]);
          
          if (error) {
            console.error(`   ❌ Failed to insert ${job.title}:`, error.message);
            errorCount++;
          } else {
            console.log(`   ✅ ${job.title} at ${job.company}`);
            successCount++;
          }
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (err) {
          console.error(`   ❌ Error with ${job.title}:`, err.message);
          errorCount++;
        }
      }
      
      console.log(`\n🎉 Upload Summary:`);
      console.log(`   Successful: ${successCount}`);
      console.log(`   Failed: ${errorCount}`);
      console.log(`   Total uploaded: ${successCount} jobs`);
      
    } else {
      console.log('\n⚠️ No truly worldwide jobs found this time.');
    }

  } catch (error) {
    console.error('❌ Error scraping:', error.message);
  }
}

// ===== DETERMINE CATEGORY =====
function determineCategory(tags) {
  const tagMap = {
    'frontend': 'Frontend',
    'backend': 'Backend', 
    'full stack': 'Fullstack',
    'devops': 'DevOps',
    'mobile': 'Mobile Development',
    'design': 'Design',
    'data': 'Data Science',
    'ai': 'AI & Machine Learning',
    'machine learning': 'AI & Machine Learning',
    'react': 'Frontend',
    'vue': 'Frontend',
    'angular': 'Frontend',
    'node': 'Backend',
    'python': 'Backend',
    'java': 'Backend',
    'javascript': 'Frontend',
    'typescript': 'Frontend',
    'ui/ux': 'Design',
    'product': 'Product',
    'marketing': 'Marketing',
    'sales': 'Sales',
    'support': 'Customer Support',
    'qa': 'QA Engineer',
    'testing': 'QA Engineer'
  };
  
  for (const tag of tags) {
    const lowerTag = tag.toLowerCase();
    if (tagMap[lowerTag]) {
      return tagMap[lowerTag];
    }
  }
  return 'General'; // Default as per your schema
}

// ===== EXECUTION =====
async function main() {
  console.log('='.repeat(60));
  console.log('🌍 SCRAPER: Worldwide Remote Jobs');
  console.log('='.repeat(60));
  console.log('Matching your Supabase schema exactly:');
  console.log('• location = "Worldwide" (default)');
  console.log('• type = "Full-Time"/"Part-Time"/"Contract"/"Internship"');
  console.log('• salaryType = enum value (Fixed, Hourly, Negotiable, Commission)');
  console.log('• slug = auto-generated (triggers your set_job_slug function)');
  console.log('='.repeat(60));
  
  await scrapeRemoteOk();
  
  console.log('='.repeat(60));
  console.log('🏁 SCRAPER COMPLETE');
  console.log('='.repeat(60));
  console.log('💡 Check: SELECT * FROM jobs ORDER BY created_at DESC LIMIT 5;');
}

// ===== RUN SCRAPER =====
main();
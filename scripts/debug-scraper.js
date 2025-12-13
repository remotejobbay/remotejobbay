require('dotenv').config({ path: '../.env.local' });

const axios = require('axios');
const cheerio = require('cheerio');

async function debugRemoteOk() {
  console.log('🔍 DEBUG: Fetching RemoteOK page...\n');

  try {
    // 1. Fetch the page
    const { data, status } = await axios.get('https://remoteok.io/remote-dev-jobs', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 10000
    });

    console.log(`✅ Page fetched. Status: ${status}`);
    console.log(`📄 Page size: ${data.length} characters\n`);

    const $ = cheerio.load(data);

    // 2. Check the page title
    const pageTitle = $('title').text();
    console.log(`📰 Page title: "${pageTitle}"\n`);

    // 3. Look for ANY job listings with different selectors
    console.log('🔎 Searching for job listings with different selectors:');

    const selectors = [
      'tr.job',
      'table.jobs tr',
      '[data-job]',
      '.job-listings .job',
      '#jobs-table tr',
      '.job-listing',
      'tbody tr',
      'table tr'
    ];

    let foundJobs = 0;
    
    for (const selector of selectors) {
      const count = $(selector).length;
      console.log(`   "${selector}": ${count} elements found`);
      
      if (count > 0 && foundJobs === 0) {
        foundJobs = count;
        
        // Show sample of what we found
        console.log(`\n📋 Sample of first matching element (selector: "${selector}"):`);
        console.log('=' .repeat(50));
        console.log($(selector).first().html().substring(0, 500) + '...');
        console.log('=' .repeat(50));
      }
    }

    // 4. Look for specific job elements
    console.log('\n🔍 Looking for specific job elements:');
    console.log(`   Elements with class "company": ${$('.company').length}`);
    console.log(`   Elements with class "title" or "h2": ${$('.title, h2').length}`);
    console.log(`   Elements with class "tags": ${$('.tags').length}`);
    console.log(`   Tables on page: ${$('table').length}`);
    console.log(`   Table rows (tr): ${$('tr').length}`);

    // 5. If we found table rows, show their structure
    if ($('tr').length > 0) {
      console.log('\n📊 First 3 table rows structure:');
      $('tr').slice(0, 3).each((i, el) => {
        const html = $(el).html();
        console.log(`\nRow ${i + 1}:`);
        console.log(`  Classes: "${$(el).attr('class') || 'none'}"`);
        console.log(`  Text preview: "${$(el).text().substring(0, 100).trim()}..."`);
        
        // Look for job data attributes
        const dataAttrs = Object.keys($(el).data() || {});
        if (dataAttrs.length > 0) {
          console.log(`  Data attributes: ${dataAttrs.join(', ')}`);
        }
      });
    }

    // 6. Check if page has job data in JSON format
    const scriptTags = $('script');
    console.log(`\n📜 Script tags on page: ${scriptTags.length}`);
    
    // Look for JSON data in scripts
    scriptTags.each((i, el) => {
      const scriptContent = $(el).html() || '';
      if (scriptContent.includes('window.__INITIAL_STATE__') || 
          scriptContent.includes('jobs') || 
          scriptContent.includes('jobListings')) {
        console.log(`\n🎯 Found potential JSON data in script tag ${i + 1}`);
        console.log(scriptContent.substring(0, 300) + '...');
      }
    });

  } catch (error) {
    console.error('❌ Error fetching page:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Headers:`, error.response.headers);
    }
  }
}

// Run debug
console.log('='.repeat(60));
console.log('🐛 REMOTEOK DEBUG SCRAPER');
console.log('='.repeat(60));
debugRemoteOk();
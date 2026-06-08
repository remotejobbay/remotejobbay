require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '../.env.local' });

const { createClient } = require('@supabase/supabase-js');

const COMPANY = 'speechify';
const COMPANY_NAME = 'Speechify';
const COMPANY_LOGO = 'https://logo.clearbit.com/speechify.com';
const GREENHOUSE_API = `https://boards-api.greenhouse.io/v1/boards/${COMPANY}/jobs?content=true`;

const TARGET_JOBS = [
  '5627270004', // Tech Lead, Android Core Product
  '4658498004', // Tech Lead, Web Core Product & Chrome Extension
  '5058944004', // Software Engineer, Platform
  '6003596004', // Go-to-Market Engineer
  '5989934004', // Go-to-Market
];

function stripHtml(html) {
  if (!html) return '';
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function getCategory(title = '') {
  const t = title.toLowerCase();
  if (['developer', 'engineer', 'software', 'android', 'ios', 'platform', 'tech lead', 'qa', 'quality assurance'].some(x => t.includes(x))) {
    return 'Development';
  }
  if (['design', 'ui', 'ux', 'artist', 'creative'].some(x => t.includes(x))) return 'Design';
  if (['marketing', 'sales', 'growth', 'go-to-market', 'gtm'].some(x => t.includes(x))) return 'Marketing';
  return 'Other';
}

function extractSalaryText(description) {
  const text = stripHtml(description);
  const match = text.match(/(?:salary range|salary).*?(?:\$|USD)\s?[\d,]+(?:\s?-\s?(?:\$|USD)?\s?[\d,]+)?(?:\s?USD\/Year)?/i);
  return match ? match[0].replace(/\s+/g, ' ').trim() : 'Not Listed';
}

async function fetchSpeechifyJobs() {
  const res = await fetch(GREENHOUSE_API, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`Greenhouse API error for ${COMPANY}: ${res.status}`);
  const data = await res.json();
  return data.jobs || [];
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials in .env.local');
  }

  const jobs = await fetchSpeechifyJobs();
  const byId = new Map(jobs.map(job => [String(job.id), job]));
  const missing = TARGET_JOBS.filter(id => !byId.has(id));
  if (missing.length) {
    throw new Error(`Could not find Speechify job IDs: ${missing.join(', ')}`);
  }

  const upserts = TARGET_JOBS.map(jobId => {
    const job = byId.get(jobId);
    const title = job.title || '';
    const applyUrl = job.absolute_url || `https://job-boards.greenhouse.io/${COMPANY}/jobs/${jobId}`;
    const location = (job.location && job.location.name) || 'Remote';
    const descriptionHtml = job.content || '';

    return {
      external_id: `greenhouse:${COMPANY}:${jobId}`,
      title,
      company: COMPANY_NAME,
      location,
      description: stripHtml(descriptionHtml) || 'No description',
      description_html: descriptionHtml || null,
      salary_text: extractSalaryText(descriptionHtml),
      apply_url: applyUrl,
      logo: COMPANY_LOGO,
      category: getCategory(title),
      source_url: applyUrl,
      source: 'Greenhouse',
      status: 'pending',
      post_to_site: false,
    };
  });

  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
  const { data, error } = await supabase
    .from('jobs')
    .upsert(upserts, { onConflict: 'external_id' })
    .select('external_id,title');

  if (error) throw error;
  for (const row of data || []) {
    console.log(`Upserted ${row.external_id} | ${row.title}`);
  }
  console.log(`Done. Upserted ${data?.length ?? 0} Speechify job(s).`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

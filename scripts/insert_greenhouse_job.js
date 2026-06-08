require('dotenv').config({ path: '../.env.local' });

const { createClient } = require('@supabase/supabase-js');

const JOB_URL = 'https://job-boards.greenhouse.io/knack/jobs/4186717009';

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function getCategory(title = '') {
  const t = title.toLowerCase();
  if (["developer", "engineer", "software", "react", "node", "python"].some(x => t.includes(x))) return 'Development';
  if (["design", "ui", "ux", "artist", "creative"].some(x => t.includes(x))) return 'Design';
  if (["marketing", "seo", "sales", "growth"].some(x => t.includes(x))) return 'Marketing';
  return 'Other';
}

function parseGreenhouseUrl(url) {
  const m = url.match(/greenhouse\.io\/([^/]+)\/jobs\/(\d+)/i);
  if (!m) return null;
  return { company: m[1], jobId: m[2] };
}

async function fetchJob(company, jobId) {
  const apiUrl = `https://boards-api.greenhouse.io/v1/boards/${company}/jobs/${jobId}?content=true`;
  const res = await fetch(apiUrl);
  if (res.ok) return res.json();

  // Fallback: fetch all jobs and filter
  const listUrl = `https://boards-api.greenhouse.io/v1/boards/${company}/jobs?content=true`;
  const listRes = await fetch(listUrl);
  if (!listRes.ok) {
    throw new Error(`Greenhouse API error: ${res.status} / ${listRes.status}`);
  }
  const listData = await listRes.json();
  const match = (listData.jobs || []).find(job => String(job.id) === String(jobId));
  if (!match) throw new Error('Job not found in Greenhouse API.');
  return match;
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials in .env.local');
  }

  const parsed = parseGreenhouseUrl(JOB_URL);
  if (!parsed) {
    throw new Error('Could not parse Greenhouse job URL.');
  }

  const { company, jobId } = parsed;
  const job = await fetchJob(company, jobId);

  const title = job.title || '';
  const applyUrl = job.absolute_url || JOB_URL;
  const location = job.location && job.location.name ? job.location.name : 'Remote';

  const jobData = {
    external_id: `greenhouse:${company}:${jobId}`,
    title,
    company: 'Knack',
    location,
    description: stripHtml(job.content || ''),
    salary_text: 'Not Listed',
    apply_url: applyUrl,
    logo: 'https://logo.clearbit.com/knack.com',
    category: getCategory(title),
    source_url: applyUrl,
    source: 'Greenhouse',
    status: 'pending',
    post_to_site: false,
  };

  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
  const { data, error } = await supabase
    .from('jobs')
    .upsert([jobData], { onConflict: 'external_id' })
    .select('external_id');

  if (error) throw error;
  console.log(`Upserted ${data?.length ?? 0} job(s).`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

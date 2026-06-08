require('dotenv').config({ path: '../.env.local' });

const { createClient } = require('@supabase/supabase-js');

const JOB_URLS = [
  'https://jobs.lever.co/curai/4565116e-6192-4676-902d-ea24bc12e3e3',
  'https://jobs.lever.co/curai/2b0ba70b-0574-435a-949a-4b218709d0d8',
  'https://jobs.lever.co/curai/1d0e126e-dde6-42fd-93d1-dd70346a4733',
];

function stripHtml(html) {
  if (!html) return '';
  return String(html)
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

function parseLeverUrl(url) {
  const m = url.match(/jobs\.lever\.co\/([^/]+)\/([a-f0-9-]+)/i);
  if (!m) return null;
  return { company: m[1], jobId: m[2] };
}

async function fetchLeverJobs(company) {
  const apiUrl = `https://api.lever.co/v0/postings/${company}?mode=json`;
  const res = await fetch(apiUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) {
    throw new Error(`Lever API error for ${company}: ${res.status}`);
  }
  return res.json();
}

function pickCompanyName(job, companySlug) {
  if (job && typeof job.company === 'string' && job.company.trim()) return job.company.trim();
  if (job && job.categories && typeof job.categories.company === 'string' && job.categories.company.trim()) return job.categories.company.trim();
  return companySlug;
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials in .env.local');
  }

  const parsed = JOB_URLS.map(url => ({ url, parsed: parseLeverUrl(url) }));
  const invalid = parsed.filter(p => !p.parsed);
  if (invalid.length) {
    throw new Error(`Could not parse Lever URL(s): ${invalid.map(i => i.url).join(', ')}`);
  }

  const companies = [...new Set(parsed.map(p => p.parsed.company))];
  const allJobsByCompany = new Map();

  for (const company of companies) {
    const jobs = await fetchLeverJobs(company);
    allJobsByCompany.set(company, jobs);
  }

  const upserts = [];
  for (const { url, parsed: { company, jobId } } of parsed) {
    const jobs = allJobsByCompany.get(company) || [];
    const match = jobs.find(j => String(j.id) === String(jobId));
    if (!match) {
      throw new Error(`Job not found for ${url} (company ${company}, id ${jobId}).`);
    }

    const title = match.text || '';
    const location = (match.categories && match.categories.location) || 'Remote';
    const description = match.descriptionPlain || stripHtml(match.description || '');
    const applyUrl = match.hostedUrl || url;
    const companyName = pickCompanyName(match, company);

    upserts.push({
      external_id: `lever:${company}:${jobId}`,
      title,
      company: companyName,
      location,
      description,
      salary_text: 'Not Listed',
      apply_url: applyUrl,
      logo: `https://logos.hunter.io/${company}.com`,
      category: getCategory(title),
      source_url: applyUrl,
      source: 'Lever',
      status: 'pending',
      post_to_site: false,
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
  const { data, error } = await supabase
    .from('jobs')
    .upsert(upserts, { onConflict: 'external_id' })
    .select('external_id');

  if (error) throw error;
  console.log(`Upserted ${data?.length ?? 0} job(s).`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

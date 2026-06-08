require('dotenv').config({ path: '../.env.local' });

const { createClient } = require('@supabase/supabase-js');

const JOB_URL = 'https://talentin.teamtailor.com/jobs/7369894-deputy-chief-legal-officer-for-balance-group';

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
  if (["legal", "lawyer", "counsel"].some(x => t.includes(x))) return 'Legal';
  return 'Other';
}

function parseJobId(url) {
  const m = url.match(/\/jobs\/(\d+)/i);
  return m ? m[1] : null;
}

function extractJsonLd(html) {
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i;
  const m = html.match(re);
  if (!m) return null;
  try {
    const parsed = JSON.parse(m[1].trim());
    if (Array.isArray(parsed)) {
      return parsed.find((item) => item && item['@type'] === 'JobPosting') || parsed[0];
    }
    return parsed;
  } catch {
    return null;
  }
}

function extractMetaContent(html, attr, name) {
  const re1 = new RegExp(`<meta[^>]+${attr}=["']${name}["'][^>]+content=["']([^"']*)["'][^>]*>`, 'i');
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+${attr}=["']${name}["'][^>]*>`, 'i');
  let m = html.match(re1);
  if (m) return m[1];
  m = html.match(re2);
  return m ? m[1] : '';
}

function formatLocationFromJsonLd(job) {
  const jobLocationType = (job && job.jobLocationType) ? String(job.jobLocationType).toLowerCase() : '';
  if (jobLocationType.includes('telecommute')) return 'Fully Remote';

  const jobLocation = job && job.jobLocation ? job.jobLocation : null;
  if (!jobLocation) return 'Multiple locations';

  const locations = Array.isArray(jobLocation) ? jobLocation : [jobLocation];
  const parts = locations.map((loc) => {
    const addr = loc && loc.address ? loc.address : {};
    const tokens = [
      addr.addressLocality,
      addr.addressRegion,
      addr.addressCountry,
    ].filter(Boolean);
    return tokens.join(', ');
  }).filter(Boolean);

  return parts.length ? parts.join(' | ') : 'Multiple locations';
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials in .env.local');
  }

  const jobId = parseJobId(JOB_URL);
  if (!jobId) throw new Error('Could not parse Teamtailor job ID.');

  const res = await fetch(JOB_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
  });
  if (!res.ok) throw new Error(`Failed to fetch job page: ${res.status}`);
  const html = await res.text();

  const jsonLd = extractJsonLd(html);
  const title = (jsonLd && jsonLd.title) || extractMetaContent(html, 'property', 'og:title') || 'Deputy Chief Legal Officer for Balance Group';
  const descriptionRaw = (jsonLd && jsonLd.description) || extractMetaContent(html, 'property', 'og:description') || '';
  const description = stripHtml(descriptionRaw);
  const company =
    (jsonLd && jsonLd.hiringOrganization && jsonLd.hiringOrganization.name) ||
    'Balance Group';
  const location = formatLocationFromJsonLd(jsonLd);
  const applyUrl = JOB_URL;

  const jobData = {
    external_id: `teamtailor:talentin:${jobId}`,
    title,
    company,
    location,
    description,
    salary_text: 'Not Listed',
    apply_url: applyUrl,
    logo: null,
    category: getCategory(title),
    source_url: applyUrl,
    source: 'Teamtailor',
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

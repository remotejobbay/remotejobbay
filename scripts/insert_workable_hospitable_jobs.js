require('dotenv').config({ path: '../.env.local' });

const { createClient } = require('@supabase/supabase-js');

const COMPANY = 'hospitable';
const JOB_URLS = [
  'https://apply.workable.com/hospitable/j/2C9EFD455D/',
  'https://apply.workable.com/hospitable/j/BE9898AAF6/',
  'https://apply.workable.com/hospitable/j/56CFE0BC48/',
  'https://apply.workable.com/hospitable/j/3C7DDE165E/',
];

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
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
  if (['developer', 'engineer', 'software', 'react', 'node', 'python'].some((x) => t.includes(x))) return 'Development';
  if (['design', 'ui', 'ux', 'artist', 'creative'].some((x) => t.includes(x))) return 'Design';
  if (['marketing', 'seo', 'sales', 'growth'].some((x) => t.includes(x))) return 'Marketing';
  return 'Other';
}

function parseShortcode(url) {
  const m = url.match(/\/j\/([A-Z0-9]+)\/?/i);
  return m ? m[1].toUpperCase() : null;
}

function normalizeLocation(loc) {
  if (!loc) return 'Remote';
  if (typeof loc === 'string') return loc || 'Remote';
  if (typeof loc === 'object') {
    return loc.city || loc.country || loc.region || loc.name || 'Remote';
  }
  return 'Remote';
}

function pickApplyUrl(job, shortcode) {
  const shortlink = job.shortlink || '';
  if (shortlink) return shortlink;
  const url = job.url || '';
  if (url) return url;
  return `https://apply.workable.com/${COMPANY}/j/${shortcode}/`;
}

async function fetchPublishedJobs() {
  const endpoint = `https://apply.workable.com/api/v3/accounts/${COMPANY}/jobs`;
  const res = await fetch(endpoint, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
  });
  if (!res.ok) throw new Error(`Workable API error: ${res.status}`);

  const data = await res.json();
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  if (data && Array.isArray(data.jobs)) return data.jobs;
  return [];
}

function extractJsonLd(html) {
  const blocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const b of blocks) {
    const raw = (b[1] || '').trim();
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const found = parsed.find((x) => x && x['@type'] === 'JobPosting');
        if (found) return found;
      } else if (parsed && parsed['@type'] === 'JobPosting') {
        return parsed;
      }
    } catch {
      // ignore bad JSON blocks
    }
  }
  return null;
}

async function scrapeWorkablePage(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const html = await res.text();
  const jsonLd = extractJsonLd(html);

  const titleFromTag = (html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '').trim();
  const title = (jsonLd && jsonLd.title) || titleFromTag.replace(/\s*-\s*Hospitable\s*$/i, '').trim();
  const company = (jsonLd && jsonLd.hiringOrganization && jsonLd.hiringOrganization.name) || 'Hospitable';
  const description = stripHtml((jsonLd && jsonLd.description) || '');
  const location = normalizeLocation((jsonLd && jsonLd.jobLocationType) ? 'Remote' : 'Remote');

  return { title, company, description, location, applyUrl: url };
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials in .env.local');
  }

  const targetShortcodes = JOB_URLS.map(parseShortcode).filter(Boolean);
  if (targetShortcodes.length !== JOB_URLS.length) {
    throw new Error('Could not parse one or more Workable shortcodes from URLs.');
  }

  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

  for (const shortcode of targetShortcodes) {
    const applyUrl = `https://apply.workable.com/${COMPANY}/j/${shortcode}/`;
    const scraped = await scrapeWorkablePage(applyUrl);
    const title = scraped.title;
    const description = scraped.description;
    const location = scraped.location;
    const idPiece = shortcode;

    const row = {
      external_id: `workable:${COMPANY}:${idPiece}`,
      title,
      company: scraped.company || COMPANY,
      location,
      description,
      salary_text: 'Not Listed',
      apply_url: applyUrl,
      logo: `https://logo.clearbit.com/${COMPANY}.com`,
      category: getCategory(title),
      source_url: applyUrl,
      source: 'Workable',
      status: 'pending',
      post_to_site: false,
    };

    const { error } = await supabase
      .from('jobs')
      .upsert([row], { onConflict: 'external_id' });

    if (error) throw error;
    console.log(`Upserted workable:${COMPANY}:${shortcode}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

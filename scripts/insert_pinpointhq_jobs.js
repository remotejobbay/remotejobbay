require('dotenv').config({ path: '../.env.local' });

const { createClient } = require('@supabase/supabase-js');

const JOB_URLS = [
  'https://spiralyze.pinpointhq.com/en/postings/a0d1780e-f472-4375-b3e4-e616a7bbc5be',
  'https://spiralyze.pinpointhq.com/en/postings/86521585-e033-4aaa-b212-f0047c93f8a8',
  'https://spiralyze.pinpointhq.com/en/postings/df9fe0bd-bc1d-409b-b4b9-660ad180e895',
  'https://spiralyze.pinpointhq.com/en/postings/25c8ee72-75cb-423e-b941-4367d85e7560',
];

const fs = require('fs');

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

function parsePinpointUrl(url) {
  const m = url.match(/^https?:\/\/([^\.]+)\.pinpointhq\.com\/[^/]+\/postings\/([a-f0-9-]+)/i);
  if (!m) return null;
  return { companySlug: m[1], jobId: m[2] };
}

function safeJsonParse(text) {
  try { return JSON.parse(text); } catch { return null; }
}

function extractNextData(html) {
  const m = html.match(/<script[^>]+id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
  if (!m) return null;
  return safeJsonParse(m[1]);
}

function extractInitialState(html) {
  const m = html.match(/__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\})\s*;\s*<\/script>/i);
  if (!m) return null;
  return safeJsonParse(m[1]);
}

function extractJsonLd(html) {
  const scripts = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  if (!scripts.length) return null;

  for (const s of scripts) {
    const json = safeJsonParse(s[1].trim());
    if (!json) continue;

    const candidate = findJobPosting(json);
    if (candidate) return candidate;
  }
  return null;
}

function findJobPosting(obj) {
  if (!obj) return null;
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findJobPosting(item);
      if (found) return found;
    }
    return null;
  }
  if (typeof obj !== 'object') return null;

  if (obj['@type'] === 'JobPosting') return obj;
  if (obj['@graph']) return findJobPosting(obj['@graph']);

  for (const key of Object.keys(obj)) {
    const found = findJobPosting(obj[key]);
    if (found) return found;
  }
  return null;
}

function findPostingById(obj, jobId) {
  if (!obj || typeof obj !== 'object') return null;

  if (obj.id && String(obj.id) === String(jobId)) {
    const title = obj.title || obj.name || obj.position || obj.role;
    const description = obj.description || obj.descriptionHtml || obj.descriptionPlain || obj.description_text;
    if (title || description) return obj;
  }

  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findPostingById(item, jobId);
      if (found) return found;
    }
  } else {
    for (const key of Object.keys(obj)) {
      const found = findPostingById(obj[key], jobId);
      if (found) return found;
    }
  }

  return null;
}

async function fetchPosting(url, jobId) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const html = await res.text();

  const nextData = extractNextData(html);
  if (nextData) {
    const found = findPostingById(nextData, jobId);
    if (found) return found;
  }

  const initialState = extractInitialState(html);
  if (initialState) {
    const found = findPostingById(initialState, jobId);
    if (found) return found;
  }

  const jsonLd = extractJsonLd(html);
  if (jsonLd) return jsonLd;

  try {
    fs.writeFileSync('.\\\\scripts\\\\_pinpoint_debug.html', html, 'utf-8');
  } catch {}

  throw new Error(`Could not locate posting data in page for ${url} (saved HTML to scripts/_pinpoint_debug.html)`);
}

function normalizePosting(posting, fallback) {
  if (posting && posting['@type'] === 'JobPosting') {
    const title = posting.title || '';
    const descriptionHtml = posting.description || '';
    const description = stripHtml(descriptionHtml);

    const org = posting.hiringOrganization;
    const company = (org && (org.name || org.legalName)) || fallback.companyName;

    let location = 'Remote';
    const jobLocation = posting.jobLocation;
    if (jobLocation) {
      const loc = Array.isArray(jobLocation) ? jobLocation[0] : jobLocation;
      const addr = loc && loc.address ? loc.address : null;
      if (addr) {
        location = [addr.addressLocality, addr.addressRegion, addr.addressCountry]
          .filter(Boolean)
          .join(', ')
          .trim() || location;
      }
    }

    const applyUrl = posting.url || fallback.applyUrl || fallback.sourceUrl;

    return {
      title,
      location,
      description,
      descriptionHtml,
      applyUrl,
      company,
    };
  }

  const title = posting.title || posting.name || posting.position || posting.role || '';
  const location =
    (posting.location && (posting.location.name || posting.location.title || posting.location)) ||
    posting.location_name ||
    posting.locationName ||
    'Remote';

  const descriptionHtml =
    posting.descriptionHtml ||
    posting.description ||
    posting.description_text ||
    posting.descriptionPlain ||
    '';

  const description = posting.descriptionPlain ? posting.descriptionPlain : stripHtml(descriptionHtml);

  const applyUrl =
    posting.applyUrl ||
    posting.apply_url ||
    posting.url ||
    posting.canonicalUrl ||
    fallback.applyUrl ||
    fallback.sourceUrl;

  const company =
    (posting.company && (posting.company.name || posting.company.title)) ||
    posting.company_name ||
    fallback.companyName;

  return {
    title,
    location,
    description,
    descriptionHtml: descriptionHtml,
    applyUrl,
    company,
  };
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials in .env.local');
  }

  const parsed = JOB_URLS.map(url => ({ url, parsed: parsePinpointUrl(url) }));
  const invalid = parsed.filter(p => !p.parsed);
  if (invalid.length) {
    throw new Error(`Could not parse Pinpoint URL(s): ${invalid.map(i => i.url).join(', ')}`);
  }

  const upserts = [];
  for (const { url, parsed: { companySlug, jobId } } of parsed) {
    const posting = await fetchPosting(url, jobId);
    const normalized = normalizePosting(posting, {
      applyUrl: url,
      sourceUrl: url,
      companyName: companySlug,
    });

    const companyName = normalized.company || companySlug;

    upserts.push({
      external_id: `pinpoint:${companySlug}:${jobId}`,
      title: normalized.title,
      company: companyName,
      location: normalized.location || 'Remote',
      description: normalized.description || 'No description',
      description_html: normalized.descriptionHtml || null,
      salary_text: 'Not Listed',
      apply_url: normalized.applyUrl || url,
      logo: `https://logos.hunter.io/${companySlug}.com`,
      category: getCategory(normalized.title),
      source_url: normalized.applyUrl || url,
      source: 'Pinpoint',
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

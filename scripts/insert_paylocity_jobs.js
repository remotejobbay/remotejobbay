require('dotenv').config({ path: '../.env.local' });

const { createClient } = require('@supabase/supabase-js');

const JOB_URLS = [
  'https://recruiting.paylocity.com/Recruiting/Jobs/Details/3900782',
  'https://recruiting.paylocity.com/Recruiting/Jobs/Details/4011018',
  'https://recruiting.paylocity.com/Recruiting/Jobs/Details/4030393',
  'https://recruiting.paylocity.com/Recruiting/Jobs/Details/4034994',
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

function toLines(html) {
  const text = stripHtml(html);
  return text
    .split(/\s*\n+\s*| {2,}/)
    .map((l) => l.trim())
    .filter(Boolean);
}

function extractMetaContent(html, attr, name) {
  const re1 = new RegExp(`<meta[^>]+${attr}=["']${name}["'][^>]+content=["']([^"']*)["'][^>]*>`, 'i');
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+${attr}=["']${name}["'][^>]*>`, 'i');
  let m = html.match(re1);
  if (m) return m[1];
  m = html.match(re2);
  return m ? m[1] : '';
}

function getCategory(title = '') {
  const t = title.toLowerCase();
  if (["developer", "engineer", "software", "react", "node", "python"].some(x => t.includes(x))) return 'Development';
  if (["design", "ui", "ux", "artist", "creative"].some(x => t.includes(x))) return 'Design';
  if (["marketing", "seo", "sales", "growth", "business development"].some(x => t.includes(x))) return 'Marketing';
  if (["legal", "lawyer", "counsel"].some(x => t.includes(x))) return 'Legal';
  return 'Other';
}

function parseJobId(url) {
  const m = url.match(/\/Details\/(\d+)/i);
  return m ? m[1] : null;
}

function guessTitleCompany(html, lines) {
  const ogTitle = extractMetaContent(html, 'property', 'og:title');
  if (ogTitle && ogTitle.includes(' - ')) {
    const [company, title] = ogTitle.split(' - ').map((s) => s.trim());
    if (company && title) return { company, title };
  }

  const breadcrumb = lines.find((l) => l.toLowerCase().includes('all jobs') && l.includes('>'));
  if (breadcrumb) {
    const parts = breadcrumb.split('>').map((p) => p.trim());
    const title = parts[parts.length - 1];
    if (title) {
      const company = lines.find((l) => l !== title && l.length > 1 && l.length < 80 && !/apply|description/i.test(l)) || '';
      return { company, title };
    }
  }

  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const title = h1Match ? h1Match[1].trim() : (ogTitle || 'Job');
  const h2Match = html.match(/<h2[^>]*>([^<]+)<\/h2>/i);
  const company = h2Match ? h2Match[1].trim() : '';
  return { company, title };
}

function guessLocation(lines) {
  const locationLine = lines.find((l) => {
    const lower = l.toLowerCase();
    if (lower.includes('apply') || lower.includes('description') || lower.includes('salary')) return false;
    return /remote|hybrid|on-site|onsite|location|office/.test(lower);
  });
  return locationLine || 'Remote';
}

function extractSection(lines, startLabel, endLabels) {
  const startIdx = lines.findIndex((l) => l.toLowerCase() === startLabel.toLowerCase());
  if (startIdx === -1) return '';
  let endIdx = lines.length;
  for (const label of endLabels) {
    const idx = lines.findIndex((l, i) => i > startIdx && l.toLowerCase() === label.toLowerCase());
    if (idx !== -1 && idx < endIdx) endIdx = idx;
  }
  const chunk = lines.slice(startIdx + 1, endIdx).filter((l) => l.toLowerCase() !== startLabel.toLowerCase());
  return chunk.join('\n').trim();
}

async function scrapeJob(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const html = await res.text();
  const lines = toLines(html);

  const { company, title } = guessTitleCompany(html, lines);
  const description = extractSection(lines, 'Description', ['Requirements', 'Salary Description', 'Apply']) ||
    extractMetaContent(html, 'property', 'og:description') ||
    '';

  const salaryText = extractSection(lines, 'Salary Description', ['Apply', 'Requirements']) || 'Not Listed';
  const location = guessLocation(lines);

  return {
    company: company || 'Unknown',
    title: title || 'Job',
    location,
    description,
    salary_text: salaryText,
  };
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials in .env.local');
  }

  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

  for (const url of JOB_URLS) {
    const jobId = parseJobId(url);
    const scraped = await scrapeJob(url);

    const jobData = {
      external_id: `paylocity:${jobId}`,
      title: scraped.title,
      company: scraped.company,
      location: scraped.location,
      description: scraped.description,
      salary_text: scraped.salary_text || 'Not Listed',
      apply_url: url,
      logo: null,
      category: getCategory(scraped.title),
      source_url: url,
      source: 'Paylocity',
      status: 'pending',
      post_to_site: false,
    };

    const { error } = await supabase
      .from('jobs')
      .upsert([jobData], { onConflict: 'external_id' });

    if (error) throw error;
    console.log(`Upserted ${jobData.external_id}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

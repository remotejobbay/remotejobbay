const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const text = fs.readFileSync(filePath, 'utf8');
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"#]+)"?\s*$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

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

async function main() {
  const envPath = path.join(process.cwd(), '.env.local');
  const env = loadEnv(envPath);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials (.env.local)');
  }

  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

  const res = await fetch('https://boards-api.greenhouse.io/v1/boards/engagedmd/jobs?content=true');
  if (!res.ok) throw new Error(`Greenhouse API error: ${res.status}`);
  const data = await res.json();

  const jobs = (data.jobs || []).slice(0, 5).map(job => {
    const title = job.title || '';
    const location = (job.location && job.location.name) ? job.location.name : 'Remote';
    const applyUrl = job.absolute_url || '';
    const jobId = job.id;
    return {
      external_id: `greenhouse:engagedmd:${jobId}`,
      title,
      company: 'EngagedMD',
      location: 'Remote',
      description: stripHtml(job.content || ''),
      salary_text: 'Not Listed',
      apply_url: applyUrl,
      logo: 'https://logos.hunter.io/engagedmd.com',
      category: getCategory(title),
      source_url: applyUrl,
      source: 'Greenhouse',
      status: 'pending',
      post_to_site: false,
    };
  });

  if (jobs.length === 0) {
    console.log('No jobs found.');
    return;
  }

  const { data: upserted, error } = await supabase
    .from('jobs')
    .upsert(jobs, { onConflict: 'external_id' })
    .select('external_id');

  if (error) throw error;
  console.log(`Upserted ${upserted?.length ?? 0} jobs.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

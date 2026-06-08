require('dotenv').config({ path: '../.env.local' });

const { createClient } = require('@supabase/supabase-js');

const JOB_URL = 'https://chess-teacher.com/hiring/';

const FALLBACK_TITLE = 'Social Media Content Creator';
const FALLBACK_DESCRIPTION = [
  'Remote Chess Academy (RCA) is one of the world’s leading online platforms for chess improvement. Founded by GM Igor Smirnov, we help thousands of students globally sharpen their chess skills through structured video courses and expert-led training.',
  'The Role: We’re looking for a creative and motivated Social Media Content Creator to help us grow our online presence and engage the global chess community. You’ll be the voice and face of RCA across Instagram, YouTube, Facebook, X, and more — crafting high-impact content and managing our social channels with precision.',
  'What You’ll Do: Develop platform-tailored content for Instagram, Facebook, X, and YouTube, with video editing where needed. Plan and schedule content calendars across platforms. Respond to comments and DMs to build a strong, active community. Stay on top of social media trends and integrate them into content strategy. Monitor content analytics and adjust strategy for better reach and engagement. Work with the team to brainstorm content ideas and grow the audience. Tailor each post to align with platform-specific algorithms and viewer behavior.',
  'Requirements: 3+ years in content creation or social media roles. Deep understanding of platform trends, tools, and best practices. Excited to work long-term and grow with the team. You understand basic chess terms and concepts well enough to communicate authentically with our audience.',
  'Perks & Benefits: Your content will reach and inspire millions of chess lovers worldwide. Work from anywhere, anytime. You’ll have space to lead, experiment, and make your mark.',
  'Apply: https://chess-teacher.com/hiring/',
].join('\n\n');

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

function extractMetaContent(html, attr, name) {
  const re1 = new RegExp(`<meta[^>]+${attr}=["']${name}["'][^>]+content=["']([^"']*)["'][^>]*>`, 'i');
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+${attr}=["']${name}["'][^>]*>`, 'i');
  let m = html.match(re1);
  if (m) return m[1];
  m = html.match(re2);
  return m ? m[1] : '';
}

function extractH1(html) {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return m ? stripHtml(m[1]) : '';
}

function getCategory(title = '') {
  const t = title.toLowerCase();
  if (["teacher", "tutor", "instructor", "coach", "educator"].some(x => t.includes(x))) return 'Education';
  return 'Other';
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials in .env.local');
  }

  let title = FALLBACK_TITLE;
  let description = FALLBACK_DESCRIPTION;

  try {
    const res = await fetch(JOB_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    if (res.ok) {
      const html = await res.text();
      title = extractH1(html) || extractMetaContent(html, 'property', 'og:title') || FALLBACK_TITLE;
      description =
        extractMetaContent(html, 'property', 'og:description') ||
        stripHtml(html) ||
        FALLBACK_DESCRIPTION;
    }
  } catch {
    // Use fallback content if fetch is blocked.
  }

  const jobData = {
    external_id: 'chess-teacher:chess-teacher:hiring',
    title,
    company: 'Remote Chess Academy',
    location: 'Remote',
    description,
    salary_text: 'Not Listed',
    apply_url: JOB_URL,
    logo: 'https://logo.clearbit.com/chess-teacher.com',
    category: getCategory(title),
    source_url: JOB_URL,
    source: 'Website',
    status: 'pending',
    post_to_site: false,
  };

  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
  const { error } = await supabase
    .from('jobs')
    .upsert([jobData], { onConflict: 'external_id' });

  if (error) throw error;
  console.log('Upserted chess-teacher job.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

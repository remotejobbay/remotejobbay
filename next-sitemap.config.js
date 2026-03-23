// next-sitemap.config.js
module.exports = {
  // Use your confirmed custom domain
  siteUrl: 'https://www.remotejobbay.com', // or 'https://remotejobbay.com' if you prefer
  generateRobotsTxt: true,
  sitemapSize: 7000,
  additionalPaths: async () => {
    const { createClient } = require('@supabase/supabase-js');
    const landingFilters = require('./src/data/landing-filters.json');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return [];
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });

    const CATEGORY_LABELS = landingFilters.categories || [];
    const JOB_TYPE_LABELS = landingFilters.jobTypes || [];
    const SKILL_LABELS = landingFilters.skills || [];
    const EXPERIENCE_LEVELS = landingFilters.experienceLevels || [];

    const toSlug = (input) =>
      input
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const MIN_JOBS_TO_INDEX = landingFilters.minJobsToIndex || 5;
    const entries = [];

    for (const category of CATEGORY_LABELS) {
      for (const type of JOB_TYPE_LABELS) {
        const { count, error } = await supabase
          .from('jobs')
          .select('id', { count: 'exact', head: true })
          .eq('post_to_site', true)
          .eq('category', category)
          .eq('type', type);

        if (error) continue;
        if ((count ?? 0) < MIN_JOBS_TO_INDEX) continue;

        entries.push({
          loc: `/remote-jobs/${toSlug(category)}/${toSlug(type)}`,
          lastmod: new Date().toISOString(),
          changefreq: 'daily',
          priority: 0.7,
        });
      }
    }

    for (const skill of SKILL_LABELS) {
      for (const experience of EXPERIENCE_LEVELS) {
        const { count, error } = await supabase
          .from('jobs')
          .select('id', { count: 'exact', head: true })
          .eq('post_to_site', true)
          .eq('experience_level', experience.value)
          .contains('skills', [skill]);

        if (error) continue;
        if ((count ?? 0) < MIN_JOBS_TO_INDEX) continue;

        entries.push({
          loc: `/remote-jobs/skill/${toSlug(skill)}/${experience.slugs?.[0] || experience.value}`,
          lastmod: new Date().toISOString(),
          changefreq: 'daily',
          priority: 0.65,
        });
      }
    }

    return entries;
  },
}

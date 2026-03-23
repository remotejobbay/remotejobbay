import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import JobCardStatic from '@/components/JobCardStatic';
import type { Job } from '@/types';
import { createServerSupabaseClient } from '@/utils/supabase/serverClient';
import landingFilters from '@/data/landing-filters.json';

const MIN_JOBS_TO_INDEX = landingFilters.minJobsToIndex;
const JOBS_PER_PAGE = landingFilters.jobsPerPage;
const SKILL_LABELS = landingFilters.skills;
const EXPERIENCE_LEVELS = landingFilters.experienceLevels;

type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

function toSlug(input: string) {
  return input
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

const SKILL_BY_SLUG = new Map(
  SKILL_LABELS.map((label) => [toSlug(label), label] as const),
);

const EXPERIENCE_BY_SLUG = new Map(
  EXPERIENCE_LEVELS.flatMap((level) =>
    level.slugs.map((slug) => [slug, level] as const),
  ),
);

function formatSkillLabel(label: string) {
  return label
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

async function fetchLandingJobs(skill: string, experience: ExperienceLevel) {
  const supabase = createServerSupabaseClient();
  const { data, error, count } = await supabase
    .from('jobs')
    .select('*', { count: 'exact' })
    .eq('post_to_site', true)
    .eq('experience_level', experience.value)
    .contains('skills', [skill])
    .order('created_at', { ascending: false })
    .limit(JOBS_PER_PAGE);

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  const jobs = (data || []).map((job: Job) => ({
    ...job,
    id: String(job.id),
    title: job.title || 'Untitled Position',
    company: job.company || 'Unknown Company',
    location: job.location || 'Remote',
    applyUrl: job.applyUrl || (job as { apply_url?: string }).apply_url || '#',
    datePosted: job.created_at || job.datePosted || new Date().toISOString(),
    salary: job.salary || 'Not Listed',
  }));

  return { jobs, total: count ?? 0 };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ skill: string; experience: string }>;
}): Promise<Metadata> {
  const { skill, experience } = await params;
  const skillLabel = SKILL_BY_SLUG.get(skill);
  const experienceLevel = EXPERIENCE_BY_SLUG.get(experience);

  if (!skillLabel || !experienceLevel) {
    return {};
  }

  const { total } = await fetchLandingJobs(skillLabel, experienceLevel);
  const formattedSkill = formatSkillLabel(skillLabel);
  const title = `${experienceLevel.label} ${formattedSkill} Remote Jobs`;
  const description = `Browse ${experienceLevel.label.toLowerCase()} remote roles that require ${formattedSkill} skills. Fully remote jobs open worldwide, updated daily.`;
  const canonical = `/remote-jobs/skill/${skill}/${experience}`;

  return {
    title: `${title} | RemoteJobBay`,
    description,
    alternates: { canonical },
    robots: {
      index: total >= MIN_JOBS_TO_INDEX,
      follow: true,
    },
    openGraph: {
      title: `${title} | RemoteJobBay`,
      description,
      url: `https://www.remotejobbay.com${canonical}`,
      siteName: 'RemoteJobBay',
      images: [
        {
          url: 'https://www.remotejobbay.com/default-logo.png',
          width: 1200,
          height: 630,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | RemoteJobBay`,
      description,
      images: ['https://www.remotejobbay.com/default-logo.png'],
    },
  };
}

export async function generateStaticParams() {
  return SKILL_LABELS.flatMap((skill) =>
    EXPERIENCE_LEVELS.map((level) => ({
      skill: toSlug(skill),
      experience: level.slugs[0],
    })),
  );
}

export const revalidate = 3600;

export default async function SkillLandingPage({
  params,
}: {
  params: Promise<{ skill: string; experience: string }>;
}) {
  const { skill, experience } = await params;
  const skillLabel = SKILL_BY_SLUG.get(skill);
  const experienceLevel = EXPERIENCE_BY_SLUG.get(experience);

  if (!skillLabel || !experienceLevel) {
    notFound();
  }

  const { jobs, total } = await fetchLandingJobs(skillLabel, experienceLevel);
  const formattedSkill = formatSkillLabel(skillLabel);
  const title = `${experienceLevel.label} ${formattedSkill} Remote Jobs`;
  const canIndex = total >= MIN_JOBS_TO_INDEX;

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-slate-50">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.3em] text-amber-700 uppercase">
              Remote jobs worldwide
            </p>
            <h1 className="mt-3 text-3xl md:text-4xl font-bold text-slate-900">
              {title}
            </h1>
            <p className="mt-4 text-base md:text-lg text-slate-600">
              Fully remote roles for {experienceLevel.label.toLowerCase()} {formattedSkill} talent.
              We curate listings with clear eligibility, compensation, and fast apply links.
            </p>
            {!canIndex && (
              <p className="mt-3 text-sm text-amber-700">
                This page is still growing. We only index landing pages once they have enough listings.
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-amber-700 text-white font-semibold hover:bg-amber-800 transition-colors"
            >
              Browse all jobs
            </Link>
            <Link
              href="/post"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-amber-700 text-amber-800 font-semibold hover:bg-amber-50 transition-colors"
            >
              Post a job
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="flex flex-wrap gap-3 text-sm text-slate-600">
          <span className="px-3 py-1 rounded-full bg-white border border-amber-200">
            Skill: <strong className="text-slate-900">{formattedSkill}</strong>
          </span>
          <span className="px-3 py-1 rounded-full bg-white border border-amber-200">
            Experience: <strong className="text-slate-900">{experienceLevel.label}</strong>
          </span>
          <span className="px-3 py-1 rounded-full bg-white border border-amber-200">
            Listings: <strong className="text-slate-900">{total}</strong>
          </span>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-4">
        {total === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-600">
            No listings yet for this combination. Check back soon or browse all roles.
          </div>
        ) : (
          jobs.map((job) => <JobCardStatic key={String(job.id)} job={job} />)
        )}
      </section>
    </main>
  );
}

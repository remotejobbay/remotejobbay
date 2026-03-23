import Link from 'next/link';
import JobCardStatic from '@/components/JobCardStatic';
import landingFilters from '@/data/landing-filters.json';
import { createServerSupabaseClient } from '@/utils/supabase/serverClient';

type SearchParams = Record<string, string | string[] | undefined>;

type JobListItem = {
  id: string | number;
  title: string;
  company: string;
  location: string;
  type: string;
  category: string;
  salary?: string | number;
  salaryType?: string;
  applyUrl?: string;
  created_at?: string;
  datePosted: string;
  logo?: string;
  numericSalary: number;
};

const JOBS_PER_PAGE = landingFilters.jobsPerPage;
const CATEGORY_LABELS = landingFilters.categories;
const JOB_TYPE_LABELS = landingFilters.jobTypes;

async function fetchJobs(): Promise<JobListItem[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('post_to_site', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error.message);
    return [];
  }

  return (data || []).map((job) => ({
    ...job,
    id: String(job.id),
    title: job.title || 'Untitled Position',
    company: job.company || 'Unknown Company',
    location: job.location || 'Remote',
    applyUrl: job.apply_url || job.applyUrl || '#',
    datePosted: job.created_at || job.datePosted || new Date().toISOString(),
    salary: job.salary || job.salary_text || 'Not Listed',
    numericSalary: parseInt(String(job.salary || job.salary_text).replace(/[^0-9]/g, '')) || 0,
    category: job.category || 'Other',
    type: job.type || (job.title?.toLowerCase().includes('contract') ? 'Contract' : 'Full-time'),
  })) as JobListItem[];
}

function normalizeTypes(typeParam: string | string[] | undefined) {
  if (!typeParam) return [];
  return Array.isArray(typeParam) ? typeParam : [typeParam];
}

function buildPageUrl(params: {
  q?: string;
  category?: string;
  types?: string[];
  minSalary?: number;
  sort?: string;
  page?: number;
}) {
  const urlParams = new URLSearchParams();
  if (params.q) urlParams.set('q', params.q);
  if (params.category) urlParams.set('category', params.category);
  if (params.minSalary && params.minSalary > 0) urlParams.set('minSalary', String(params.minSalary));
  if (params.sort && params.sort !== 'newest') urlParams.set('sort', params.sort);
  if (params.page && params.page > 1) urlParams.set('page', String(params.page));
  if (params.types && params.types.length > 0) {
    params.types.forEach((type) => urlParams.append('type', type));
  }
  const qs = urlParams.toString();
  return qs ? `/?${qs}` : '/';
}

export const revalidate = 3600;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const q = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q.trim() : '';
  const category = typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : 'All';
  const types = normalizeTypes(resolvedSearchParams.type);
  const minSalary = Number(resolvedSearchParams.minSalary || 0) || 0;
  const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : 'newest';
  const page = Math.max(1, Number(resolvedSearchParams.page || 1) || 1);

  const jobs = await fetchJobs();
  const filteredJobs = jobs
    .filter((job) => {
      const jobText = `${job.title} ${job.company} ${job.category}`.toLowerCase();
      const matchSearch = q ? jobText.includes(q.toLowerCase()) : true;
      const matchCategory = category === 'All' || job.category === category;
      const matchType = types.length === 0 || types.includes(job.type);
      const matchSalary = minSalary === 0 || (job.numericSalary && job.numericSalary >= minSalary * 1000);
      return matchSearch && matchCategory && matchType && matchSalary;
    })
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.datePosted || '').getTime() - new Date(a.datePosted || '').getTime();
      if (sort === 'oldest') return new Date(a.datePosted || '').getTime() - new Date(b.datePosted || '').getTime();
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / JOBS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * JOBS_PER_PAGE;
  const pageJobs = filteredJobs.slice(start, start + JOBS_PER_PAGE);

  const baseParams = {
    q,
    category,
    types,
    minSalary,
    sort,
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-amber-50">
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-amber-700 uppercase">
              Remote jobs, verified
            </p>
            <h1 className="mt-3 text-3xl md:text-4xl font-bold text-slate-900">
              Browse remote jobs with clear eligibility
            </h1>
            <p className="mt-4 text-base md:text-lg text-slate-600 max-w-2xl">
              Use filters to find fully remote roles across engineering, design, marketing, product,
              and support. Updated daily with vetted listings.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/remote-jobs"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-amber-700 text-amber-800 font-semibold hover:bg-amber-50 transition-colors"
            >
              SEO landing page
            </Link>
            <Link
              href="/post"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-amber-700 text-white font-semibold hover:bg-amber-800 transition-colors"
            >
              Post a job
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-6">
        <form method="get" className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 grid gap-5 md:grid-cols-4">
          <div className="md:col-span-2">
            <label htmlFor="q" className="text-sm font-semibold text-slate-600">
              Search
            </label>
            <input
              id="q"
              name="q"
              defaultValue={q}
              placeholder="Job title, keyword, or company"
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
            />
          </div>
          <div>
            <label htmlFor="category" className="text-sm font-semibold text-slate-600">
              Category
            </label>
            <select
              id="category"
              name="category"
              defaultValue={category}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800 bg-white"
            >
              <option value="All">All</option>
              {CATEGORY_LABELS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sort" className="text-sm font-semibold text-slate-600">
              Sort
            </label>
            <select
              id="sort"
              name="sort"
              defaultValue={sort}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800 bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
          <div className="md:col-span-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-slate-600">Job Type</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-slate-700">
                  {JOB_TYPE_LABELS.map((type) => (
                    <label key={type} className="flex items-center gap-2">
                      <input type="checkbox" name="type" value={type} defaultChecked={types.includes(type)} />
                      {type}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="minSalary" className="text-sm font-semibold text-slate-600">
                  Min Salary (USD)
                </label>
                <input
                  id="minSalary"
                  name="minSalary"
                  type="range"
                  min="0"
                  max="200"
                  step="10"
                  defaultValue={minSalary}
                  className="mt-3 w-full accent-amber-600"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
                  <span>$0</span>
                  <span className="text-amber-700 font-bold">
                    {minSalary > 0 ? `$${minSalary}k+` : 'Any'}
                  </span>
                  <span>$200k+</span>
                </div>
              </div>
            </div>
          </div>
          <div className="md:col-span-4 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-amber-700 text-white font-semibold hover:bg-amber-800 transition-colors"
            >
              Apply Filters
            </button>
            <Link
              href="/"
              className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              Clear filters
            </Link>
          </div>
        </form>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">
            {category === 'All' ? 'Latest Opportunities' : `${category} Roles`}
            <span className="ml-2 text-sm font-normal text-slate-500">({filteredJobs.length} jobs)</span>
          </h2>
          <p className="text-sm text-slate-500 mt-2 sm:mt-0">
            Page {currentPage} of {totalPages}
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-16 space-y-4">
        {pageJobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border border-dashed border-slate-300 shadow-sm">
            <p className="text-slate-500 font-medium text-lg mb-2">No jobs match your filters</p>
            <Link href="/" className="text-amber-700 hover:underline">
              Clear all filters
            </Link>
          </div>
        ) : (
          pageJobs.map((job) => <JobCardStatic key={String(job.id)} job={job} />)
        )}
      </section>

      {totalPages > 1 && (
        <section className="max-w-7xl mx-auto px-4 pb-16">
          <div className="flex justify-center items-center gap-3">
            <Link
              aria-disabled={currentPage === 1}
              className={`px-4 py-2 rounded border border-slate-200 ${
                currentPage === 1 ? 'opacity-40 pointer-events-none' : 'hover:bg-amber-700 hover:text-white'
              }`}
              href={buildPageUrl({ ...baseParams, page: currentPage - 1 })}
            >
              Previous
            </Link>
            <span className="text-sm font-semibold text-slate-600">
              {currentPage} / {totalPages}
            </span>
            <Link
              aria-disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded border border-slate-200 ${
                currentPage === totalPages ? 'opacity-40 pointer-events-none' : 'hover:bg-amber-700 hover:text-white'
              }`}
              href={buildPageUrl({ ...baseParams, page: currentPage + 1 })}
            >
              Next
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}

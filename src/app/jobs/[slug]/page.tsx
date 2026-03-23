import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import {
  FaBriefcase,
  FaBuilding,
  FaCalendarAlt,
  FaExternalLinkAlt,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaTags,
} from 'react-icons/fa';
import type { Job } from '@/types';
import { createServerSupabaseClient } from '@/utils/supabase/serverClient';

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

type RawJob = {
  [key: string]: unknown;
  id?: string | number;
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  description_html?: string;
  logo?: string;
  apply_url?: string;
  applyUrl?: string;
  created_at?: string;
  datePosted?: string;
  salary?: string | number;
  salary_text?: string;
  salaryType?: string;
  type?: string;
  category?: string;
  slug?: string | number;
};

const markdownSchema = {
  ...defaultSchema,
  tagNames: Array.from(new Set([
    ...(defaultSchema.tagNames ?? []),
    'table',
    'thead',
    'tbody',
    'tfoot',
    'tr',
    'th',
    'td',
    'mark',
    'hr',
    'span',
  ])),
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a || []), 'target', 'rel'],
    th: ['align'],
    td: ['align'],
    span: ['data-font'],
  },
};

function extractIdFromSlug(slug: string) {
  const parts = slug.split('-');
  const last = parts[parts.length - 1];
  if (!last) return null;
  const id = Number(last);
  return Number.isFinite(id) ? id : null;
}

function generateJobUrl(title: string, id: string | number) {
  if (!title) return `/jobs/${id}`;
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return `/jobs/${cleanTitle}-${id}`;
}

function autoFormatDescription(input: string) {
  const text = input.replace(/\r\n/g, '\n').trim();
  if (!text) return '';

  const hasMarkdown = /(^|\n)\s{0,3}(#{1,6}\s|\- |\* |\d+\.\s|> |\[.+\]\(.+\))/m.test(text);
  if (hasMarkdown) return text;

  const lines = text.split('\n').map((line) => line.trim());
  const output: string[] = [];
  let inList = false;
  let lastHeadingLevel = 2;

  const isShortTitle = (line: string) => {
    if (!line) return false;
    if (line.length > 60) return false;
    if (/[.!?]$/.test(line)) return false;
    const words = line.split(/\s+/);
    if (words.length > 8) return false;
    const capitalized = words.filter((word) => /^[A-Z0-9][\w&/-]*$/.test(word));
    return capitalized.length >= Math.max(1, Math.floor(words.length * 0.6));
  };

  const pushParagraph = (line: string) => {
    if (!line) return;
    output.push(line);
    output.push('');
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line) {
      if (inList) {
        output.push('');
        inList = false;
      }
      continue;
    }

    const bullet = /^(\-|\*|•|\d+\.)\s+/.test(line);
    if (bullet) {
      inList = true;
      output.push(line.replace(/^•\s+/, '- '));
      continue;
    }

    if (line.endsWith(':')) {
      if (inList) {
        output.push('');
        inList = false;
      }
      const level = output.length === 0 ? 1 : lastHeadingLevel;
      output.push(`${'#'.repeat(level)} ${line.replace(/:$/, '')}`);
      output.push('');
      lastHeadingLevel = Math.min(3, level + 1);
      continue;
    }

    if (isShortTitle(line)) {
      if (inList) {
        output.push('');
        inList = false;
      }
      const level = output.length === 0 ? 1 : 2;
      output.push(`${'#'.repeat(level)} ${line}`);
      output.push('');
      continue;
    }

    pushParagraph(line);
  }

  return output.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function normalizeJobData(rawJob: RawJob): Job {
  let finalSalary = 'Not specified';
  if (rawJob.salary_text && rawJob.salary_text !== 'Not Listed') {
    finalSalary = String(rawJob.salary_text);
  } else if (rawJob.salary && rawJob.salary !== '0' && rawJob.salary !== 0 && rawJob.salary !== 'Not Listed') {
    finalSalary = String(rawJob.salary);
  } else if (rawJob.salaryType && rawJob.salaryType !== 'None') {
    finalSalary = String(rawJob.salaryType);
  }

  return {
    ...rawJob,
    id: String(rawJob.id),
    title: rawJob.title || 'Untitled Position',
    company: rawJob.company || 'Unknown Company',
    location: rawJob.location || 'Remote',
    description: rawJob.description || 'No description available.',
    description_html: rawJob.description_html,
    logo: rawJob.logo,
    applyUrl: rawJob.apply_url || rawJob.applyUrl || '#',
    datePosted: rawJob.created_at || rawJob.datePosted || new Date().toISOString(),
    salary: finalSalary,
    type: rawJob.type || (rawJob.title?.toLowerCase().includes('contract') ? 'Contract' : 'Full-time'),
    category: rawJob.category || 'Other',
    slug: String(rawJob.slug ?? rawJob.id),
  };
}

async function fetchJob(jobId: number) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('post_to_site', true)
    .eq('id', jobId)
    .maybeSingle();

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }
  if (!data) return null;
  return normalizeJobData(data as RawJob);
}

async function fetchRelated(job: Job) {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from('jobs')
    .select('*')
    .eq('post_to_site', true)
    .neq('id', job.id)
    .eq('category', job.category)
    .limit(4);

  return (data || []).map((item: RawJob) => normalizeJobData(item));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const jobId = extractIdFromSlug(slug);
  if (!jobId) return {};

  const job = await fetchJob(jobId);
  if (!job) return {};

  const canonical = `/jobs/${slug}`;
  const descriptionSource = job.description || job.description_html || '';
  const description = descriptionSource.replace(/<[^>]+>/g, '').slice(0, 160);

  return {
    title: `${job.title} at ${job.company} | RemoteJobBay`,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${job.title} at ${job.company} | RemoteJobBay`,
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
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${job.title} at ${job.company} | RemoteJobBay`,
      description,
      images: ['https://www.remotejobbay.com/default-logo.png'],
    },
  };
}

export const revalidate = 3600;

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const jobId = extractIdFromSlug(slug);
  if (!jobId) notFound();

  const job = await fetchJob(jobId);
  if (!job) notFound();

  const relatedJobs = await fetchRelated(job);
  const markdownText =
    typeof job.description_html === 'string' && job.description_html.trim().length > 0
      ? job.description_html.trim()
      : autoFormatDescription(job.description || '');

  return (
    <main className="bg-[#f3f4f6] min-h-screen pb-20 font-sans">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-[0_2px_5px_rgba(0,0,0,0.1)]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center text-[#6b7280] hover:text-[#2563eb] font-medium transition-colors">
            Back to Search
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'JobPosting',
              title: job.title,
              description: markdownText || job.description || '',
              datePosted: job.datePosted,
              employmentType: job.type,
              hiringOrganization: {
                '@type': 'Organization',
                name: job.company,
                logo: job.logo || undefined,
              },
              jobLocationType: 'TELECOMMUTE',
              applicantLocationRequirements: {
                '@type': 'Country',
                name: 'Worldwide',
              },
              jobLocation: {
                '@type': 'Place',
                address: {
                  '@type': 'PostalAddress',
                  addressCountry: 'Worldwide',
                },
              },
              baseSalary: job.salary
                ? {
                    '@type': 'MonetaryAmount',
                    currency: 'USD',
                    value: {
                      '@type': 'QuantitativeValue',
                      value: job.salary,
                      unitText: job.salaryType === 'hourly' ? 'HOUR' : 'YEAR',
                    },
                  }
                : undefined,
              directApply: true,
              url: `https://www.remotejobbay.com${generateJobUrl(job.title, job.id)}`,
            }),
          }}
        />
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <section className="bg-white border border-slate-200 rounded-xl p-8">
              <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8">
                {job.logo ? (
                  <img
                    src={job.logo}
                    alt={job.company}
                    className="w-[80px] h-[80px] rounded-[8px] object-cover border border-slate-100 p-1 bg-white flex-shrink-0"
                  />
                ) : (
                  <div className="w-[80px] h-[80px] rounded-[8px] bg-[#dbeafe] flex items-center justify-center text-[#2563eb] text-3xl font-bold border border-[#dbeafe] flex-shrink-0">
                    {job.company?.trim()?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold text-[#1f2937] leading-tight mb-3">{job.title}</h1>
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-[#6b7280]">
                    <span className="flex items-center gap-1.5 font-medium text-[#2563eb]">
                      <FaBuilding className="text-sm" /> {job.company}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FaMapMarkerAlt className="text-sm" /> {job.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FaCalendarAlt className="text-sm" /> {new Date(job.datePosted).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="prose prose-slate max-w-none border-t border-slate-100 pt-8 text-[#1f2937] text-lg leading-[1.75]">
                <ReactMarkdown
                  rehypePlugins={[rehypeRaw, [rehypeSanitize, markdownSchema]]}
                  components={{
                    h1: (props) => <h2 className="text-3xl font-serif font-semibold text-[#111827] mt-8 mb-4" {...props} />,
                    h2: (props) => <h3 className="text-2xl font-serif font-semibold text-[#111827] mt-6 mb-3" {...props} />,
                    h3: (props) => <h4 className="text-xl font-serif font-semibold text-[#111827] mt-5 mb-2" {...props} />,
                    p: (props) => <p className="my-4" {...props} />,
                    ul: (props) => <ul className="my-4 list-disc pl-6" {...props} />,
                    ol: (props) => <ol className="my-4 list-decimal pl-6" {...props} />,
                    li: (props) => <li className="my-1" {...props} />,
                    a: (props) => <a className="text-[#2563eb] underline underline-offset-4" target="_blank" rel="noopener noreferrer" {...props} />,
                    strong: (props) => <strong className="text-[#111827] font-semibold" {...props} />,
                    blockquote: (props) => <blockquote className="border-l-4 border-slate-200 pl-4 italic text-slate-700" {...props} />,
                    mark: (props) => <mark className="bg-amber-100 text-[#111827] px-1 py-0.5 rounded-sm" {...props} />,
                    table: (props) => <table className="my-6 w-full border-collapse text-left" {...props} />,
                    th: (props) => <th className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-[#111827]" {...props} />,
                    td: (props) => <td className="border-b border-slate-100 px-3 py-2 text-sm text-[#111827]" {...props} />,
                  }}
                >
                  {markdownText || 'No description available.'}
                </ReactMarkdown>
              </div>

              <div className="mt-12 pt-10 border-t border-slate-200 flex flex-col items-center text-center">
                <h3 className="text-2xl font-bold text-[#1f2937] mb-6">Ready to join the team?</h3>
                <a
                  href={job.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-amber-500 hover:bg-amber-600 text-white px-10 py-4 rounded-[8px] font-bold text-[1.1rem] flex items-center gap-3 transition-all duration-300 shadow-[0_4px_6px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_15px_rgba(0,0,0,0.1)] hover:-translate-y-[2px]"
                >
                  Apply for this position <FaExternalLinkAlt className="text-sm" />
                </a>
              </div>
            </section>

            {relatedJobs.length > 0 && (
              <section>
                <h3 className="text-xl font-bold text-[#1f2937] mb-6">Similar Opportunities</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {relatedJobs.map((sim) => (
                    <Link
                      key={String(sim.id)}
                      href={generateJobUrl(sim.title, sim.id)}
                      className="block group bg-white border border-slate-200 p-5 rounded-lg hover:border-[#2563eb] transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {sim.logo ? (
                          <img
                            src={sim.logo}
                            alt={sim.company}
                            className="w-[48px] h-[48px] rounded-[8px] object-cover border border-slate-100 bg-white"
                          />
                        ) : (
                          <div className="w-[48px] h-[48px] rounded-[8px] bg-[#dbeafe] flex items-center justify-center text-[#2563eb] text-lg font-bold border border-[#dbeafe]">
                            {sim.company?.trim()?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-bold text-[#1f2937] group-hover:text-[#2563eb] transition-colors line-clamp-1 mb-1">
                            {sim.title}
                          </h4>
                          <p className="text-[#6b7280] text-sm mb-3">{sim.company}</p>
                          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-[#6b7280]">
                            <span className="truncate">{sim.location}</span>
                            <span className="text-[#2563eb] bg-[#dbeafe] px-2 py-1 rounded-full">{sim.type}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="p-2">
                <div className="pl-5 border-l-2 border-amber-300/80">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-[0.7rem] tracking-[0.35em] uppercase text-amber-700 font-semibold">Role Snapshot</span>
                    <span className="h-px flex-1 bg-amber-200/70"></span>
                  </div>
                  <h3 className="text-2xl font-serif font-semibold text-[#1f2937] mb-8">Job Details</h3>
                </div>
                <div className="space-y-6 pl-5 border-l-2 border-slate-100">
                  <DetailItem icon={<FaMoneyBillWave />} label="Salary Range" value={String(job.salary ?? 'Not specified')} />
                  <DetailItem icon={<FaTags />} label="Category" value={String(job.category ?? 'Other')} />
                  <DetailItem icon={<FaBriefcase />} label="Job Type" value={String(job.type ?? 'Full-time')} className="capitalize" />
                  <DetailItem icon={<FaMapMarkerAlt />} label="Location" value={String(job.location ?? 'Remote')} />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function DetailItem({ icon, label, value, className = '' }: { icon: React.ReactNode, label: string, value: string, className?: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="h-11 w-11 rounded-full bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center text-lg shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[0.7rem] font-semibold text-[#6b7280] uppercase tracking-[0.25em] mb-1">{label}</p>
        <p className={`text-[#1f2937] font-semibold text-lg ${className}`}>{value}</p>
      </div>
    </div>
  );
}

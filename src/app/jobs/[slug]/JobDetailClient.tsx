'use client';

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import {
  FaStar,
  FaRegStar,
  FaBriefcase,
  FaBuilding,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaTags,
  FaChevronLeft,
  FaExternalLinkAlt,
  FaEnvelope,
  FaShareAlt,
} from 'react-icons/fa';
import { Job } from '@/types';
import { supabase } from '@/utils/supabase/supabaseClient';

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

export default function JobDetailClient({ slug }: { slug: string }) {
  const [job, setJob] = useState<Job | null>(null);
  const [bookmarked, setBookmarked] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [similarJobs, setSimilarJobs] = useState<Job[]>([]);
  const [logoError, setLogoError] = useState(false);
  const [similarLogoErrors, setSimilarLogoErrors] = useState<Record<string, boolean>>({});

  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState('');
  const [shareMessage, setShareMessage] = useState('');

  const markdownSchema = useMemo(() => {
    const baseTags = defaultSchema.tagNames ?? [];
    return {
      ...defaultSchema,
      tagNames: Array.from(new Set([
        ...baseTags,
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
  }, []);

  const autoFormatDescription = (input: string) => {
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
      const next = lines[i + 1] || '';

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
  };

  const normalizeJobData = (rawJob: RawJob): Job => {
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
  };

  useEffect(() => {
    async function fetchJobAndSimilar() {
      if (!slug) return;
      setLoading(true);
      try {
        const jobId = slug.split('-').pop();
        if (!jobId || isNaN(Number(jobId))) {
          setJob(null);
          setLoading(false);
          return;
        }

        const { data: manualData } = await supabase
          .from('jobs')
          .select('*')
          .eq('post_to_site', true)
          .eq('id', jobId)
          .maybeSingle();

        if (manualData) {
          const foundJob = normalizeJobData(manualData);
          setJob(foundJob);

          const { data: relatedRaw } = await supabase
            .from('jobs')
            .select('*')
            .eq('post_to_site', true)
            .neq('id', foundJob.id)
            .eq('category', foundJob.category)
            .limit(4);

          if (relatedRaw) {
            setSimilarJobs(relatedRaw.map(normalizeJobData));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchJobAndSimilar();
  }, [slug]);

  useEffect(() => {
    const saved = localStorage.getItem('bookmarkedJobs');
    if (saved) {
      try {
        setBookmarked(JSON.parse(saved));
      } catch {
        setBookmarked([]);
      }
    }
  }, []);

  const toggleBookmark = () => {
    if (!job) return;
    const idStr = String(job.id);
    const updated = bookmarked.includes(idStr)
      ? bookmarked.filter((b) => b !== idStr)
      : [...bookmarked, idStr];
    setBookmarked(updated);
    localStorage.setItem('bookmarkedJobs', JSON.stringify(updated));
  };

  const markSimilarLogoError = (id: string) => {
    setSimilarLogoErrors((prev) => ({ ...prev, [id]: true }));
  };

  const getCompanyInitial = (company: string) => (company?.trim()?.charAt(0) || '?').toUpperCase();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
    setSubscribeMessage('');

    try {
      const { error } = await supabase.from('emails').insert([{ email }]);
      if (error) throw error;
      setSubscribeMessage('Subscribed successfully!');
      setEmail('');
    } catch (error) {
      setSubscribeMessage('Error subscribing. Please try again.');
      console.error('Subscription error:', JSON.stringify(error, null, 2));
    } finally {
      setSubscribing(false);
    }
  };

  const handleShare = async () => {
    if (!job) return;
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareTitle = `${job.title} at ${job.company}`;
    const shareText = `Check out this job: ${shareTitle}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        setShareMessage('Shared successfully.');
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setShareMessage('Link copied to clipboard.');
        return;
      }

      setShareMessage('Sharing not supported on this browser.');
    } catch (error) {
      console.error('Share error:', error);
      setShareMessage('Unable to share. Please try again.');
    }
  };

  useEffect(() => {
    if (!shareMessage) return;
    const timer = setTimeout(() => setShareMessage(''), 2500);
    return () => clearTimeout(timer);
  }, [shareMessage]);

  const markdownText = useMemo(() => {
    if (typeof job?.description_html === 'string' && job.description_html.trim().length > 0) {
      return job.description_html.trim();
    }
    if (typeof job?.description === 'string' && job.description.trim().length > 0) {
      return autoFormatDescription(job.description);
    }
    return 'No description available.';
  }, [job?.description, job?.description_html]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6]">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 bg-[#dbeafe] rounded-full mb-4"></div>
        <div className="h-4 w-32 bg-slate-200 rounded"></div>
      </div>
    </div>
  );

  if (!job) return <div className="p-20 text-center">Job not found.</div>;

  return (
    <main className="bg-[#f3f4f6] min-h-screen pb-20 font-sans">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-[0_2px_5px_rgba(0,0,0,0.1)]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center text-[#6b7280] hover:text-[#2563eb] font-medium transition-colors">
            <FaChevronLeft className="mr-2 text-xs" /> Back to Search
          </Link>
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="p-2.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500"
              aria-label="Share job"
              title="Share job"
            >
              <FaShareAlt />
            </button>
            <button onClick={toggleBookmark} className="p-2.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors">
              {bookmarked.includes(String(job.id)) ? <FaStar className="text-yellow-500" /> : <FaRegStar className="text-slate-400" />}
            </button>
          </div>
        </div>
        {shareMessage && (
          <div className="max-w-6xl mx-auto px-4 pb-3">
            <p className="text-sm text-slate-600">{shareMessage}</p>
          </div>
        )}
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <section className="bg-white border border-slate-200 rounded-xl p-8">
              <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8">
                {job.logo && !logoError ? (
                  <img
                    src={job.logo}
                    alt={job.company}
                    className="w-[80px] h-[80px] rounded-[8px] object-cover border border-slate-100 p-1 bg-white flex-shrink-0"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <div className="w-[80px] h-[80px] rounded-[8px] bg-[#dbeafe] flex items-center justify-center text-[#2563eb] text-3xl font-bold border border-[#dbeafe] flex-shrink-0">
                    {getCompanyInitial(job.company)}
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
                    span: ({ node, ...props }) => {
                      const font = (node?.properties?.['data-font'] as string | undefined) ?? '';
                      const className = font === 'serif'
                        ? 'font-serif'
                        : font === 'mono'
                          ? 'font-mono'
                          : font === 'display'
                            ? 'font-serif tracking-wide'
                            : '';
                      return <span className={className} {...props} />;
                    },
                  }}
                >
                  {markdownText}
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

            {similarJobs.length > 0 && (
              <section>
                <h3 className="text-xl font-bold text-[#1f2937] mb-6 flex items-center gap-2">Similar Opportunities</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {similarJobs.map((sim) => {
                    const simId = String(sim.id);
                    const simLogoFailed = similarLogoErrors[simId];

                    return (
                      <Link
                        key={simId}
                        href={`/jobs/${sim.slug || sim.id}`}
                        className="block group bg-white border border-slate-200 p-5 rounded-lg hover:border-[#2563eb] transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          {sim.logo && !simLogoFailed ? (
                            <img
                              src={sim.logo}
                              alt={sim.company}
                              className="w-[48px] h-[48px] rounded-[8px] object-cover border border-slate-100 bg-white"
                              onError={() => markSimilarLogoError(simId)}
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-[48px] h-[48px] rounded-[8px] bg-[#dbeafe] flex items-center justify-center text-[#2563eb] text-lg font-bold border border-[#dbeafe]">
                              {getCompanyInitial(sim.company)}
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
                    );
                  })}
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

              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-[#1f2937] mb-4">Get Similar Job Alerts</h3>
                <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 bg-white p-2 rounded-md border border-gray-200">
                    <FaEnvelope className="text-gray-400 ml-2" />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 px-2 py-1 w-full text-sm text-gray-800 focus:outline-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={subscribing}
                    className="w-full px-4 py-2.5 bg-[#2563eb] text-white text-sm font-medium rounded-md hover:bg-[#1d4ed8] transition-colors disabled:opacity-50"
                  >
                    {subscribing ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </form>
                {subscribeMessage && (
                  <p className={`mt-3 text-sm font-medium text-center ${subscribeMessage.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                    {subscribeMessage}
                  </p>
                )}
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


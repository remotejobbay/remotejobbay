import Link from 'next/link';
import { FaMapMarkerAlt, FaBriefcase, FaTag } from 'react-icons/fa';
import type { Job } from '@/types';

const generateJobUrl = (title: string, id: string | number) => {
  if (!title) return `/jobs/${id}`;
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return `/jobs/${cleanTitle}-${id}`;
};

const formatSalary = (job: Job) => {
  if (!job.salary || job.salary === '0' || String(job.salary).toLowerCase() === 'not listed') {
    return 'Competitive';
  }

  if (typeof job.salary === 'string' && isNaN(Number(job.salary))) {
    return job.salary;
  }

  const amount = Number(job.salary).toLocaleString();
  return job.salaryType === 'hourly' ? `$${amount}/hr` : `$${amount}/yr`;
};

export default function JobCardStatic({ job }: { job: Job }) {
  const jobUrl = generateJobUrl(job.title, job.id);
  const salaryText = formatSalary(job);
  const salaryClass = salaryText === 'Competitive' ? 'text-amber-700' : 'text-slate-800';

  return (
    <article className="bg-white p-5 rounded-[8px] shadow-[0_4px_6px_rgba(0,0,0,0.1)] border border-transparent">
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-5 items-start">
        <div className="flex justify-between items-start w-full md:w-auto">
          <div className="flex-shrink-0">
            {job.logo ? (
              <img
                src={job.logo}
                alt={job.company}
                className="w-[60px] h-[60px] rounded-[8px] object-cover"
              />
            ) : (
              <div className="w-[60px] h-[60px] flex items-center justify-center bg-[#dbeafe] text-[#2563eb] rounded-[8px] font-bold text-xl">
                {job.company?.charAt(0) || '?'}
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0">
          <Link href={jobUrl}>
            <h3 className="text-[1.1rem] font-bold text-[#1f2937] mb-1 hover:text-[#2563eb] transition-colors leading-tight">
              {job.title}
            </h3>
          </Link>
          <p className="text-[0.95rem] text-[#6b7280] mb-1">{job.company}</p>

          <div className="flex flex-wrap gap-4 mt-3 text-[0.85rem] text-[#6b7280]">
            {job.location && (
              <span className="flex items-center gap-1.5">
                <FaMapMarkerAlt className="text-[#6b7280]" /> {job.location}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <FaBriefcase className="text-[#6b7280]" /> {job.type}
            </span>
            {job.category && (
              <span className="flex items-center gap-1.5">
                <FaTag className="text-[#6b7280]" /> {job.category}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-row md:flex-col justify-between items-center md:items-end h-full gap-2">
          <div className={`font-bold text-[1rem] whitespace-nowrap ${salaryClass}`}>
            {salaryText}
          </div>
          <Link
            href={jobUrl}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-[8px] font-semibold text-[0.95rem] transition-colors"
          >
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}

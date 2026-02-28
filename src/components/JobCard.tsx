'use client';

import Link from 'next/link';
import {
  FaRegStar,
  FaStar,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaTags,
  FaExternalLinkAlt,
} from 'react-icons/fa';
import { Job } from '@/types';
import { motion } from 'framer-motion';
import { useState } from 'react';

// Fix for TypeScript gtag error
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

interface Props {
  job: Job;
  bookmarked?: string[];
  toggleBookmark?: (id: string | number) => void;
  showBookmark?: boolean;
}

// --- URL HELPER ---
const generateJobUrl = (title: string, id: string | number) => {
  if (!title) return `/jobs/${id}`;
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return `/jobs/${cleanTitle}-${id}`;
};

export default function JobCard({
  job,
  bookmarked = [],
  toggleBookmark,
  showBookmark = true,
}: Props) {
  const isBookmarked = bookmarked.includes(String(job.id));
  const [logoError, setLogoError] = useState(false);

  /* ─────────── Helpers ─────────── */
  const postedLabel = (d: string) => {
    try {
      const diff = Math.floor(
        (Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (isNaN(diff)) return 'Recently';
      if (diff <= 0) return 'Today';
      if (diff === 1) return '1 day ago';
      if (diff < 7) return `${diff} days ago`;
      if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
      return `${Math.floor(diff / 30)}mo ago`;
    } catch (e) {
      return 'Recently';
    }
  };

  const isNewJob = (d: string) => {
    const diff = Math.floor(
      (Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff <= 3;
  };

  const shouldShowLogo = job.logo && !logoError && job.logo.trim() !== '';

  const trackClick = () => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'job_click', {
        event_category: 'jobs',
        event_label: `${job.title} at ${job.company}`,
        job_id: job.id,
      });
    }
  };

  const displaySalary = () => {
    if (!job.salary || job.salary === '0') return 'Competitive';
    if (typeof job.salary === 'string' && isNaN(Number(job.salary))) {
        return job.salary;
    }
    const amount = Number(job.salary).toLocaleString();
    return job.salaryType === 'hourly' ? `$${amount}/hr` : `$${amount}/yr`;
  };

  const jobUrl = generateJobUrl(job.title, job.id);

  /* ─────────── Render ─────────── */
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group relative bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg border border-teal-50 hover:border-teal-200 transition-all duration-300"
    >
      {/* "New" Badge */}
      {isNewJob(job.datePosted) && (
        <div className="absolute -top-3 -left-2 z-10">
          <span className="bg-gradient-to-r from-teal-500 to-indigo-500 text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full shadow-md border border-white">
            New
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-6">
        
        {/* 1. Logo Match */}
        <div className="flex-shrink-0 flex items-start">
          {shouldShowLogo ? (
            <img
              src={job.logo}
              alt={job.company}
              onError={() => setLogoError(true)}
              className="w-16 h-16 object-contain rounded-full border-2 border-teal-100 shadow-md bg-white transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-16 h-16 flex items-center justify-center bg-teal-100 rounded-full text-teal-600 font-bold text-2xl shadow-md border-2 border-teal-100 transition-transform duration-300 group-hover:scale-105">
              {job.company.charAt(0)}
            </div>
          )}
        </div>

        {/* 2. Content Body (Matched to JobDetail styling) */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <Link href={jobUrl} onClick={trackClick} className="block group/link">
            <h3 className="text-xl md:text-2xl font-extrabold text-teal-800 font-poppins drop-shadow-sm group-hover/link:text-indigo-600 transition-colors leading-tight mb-1">
              {job.title}
            </h3>
          </Link>
          
          <p className="text-base text-indigo-600 font-semibold font-poppins mb-3">
            {job.company}
          </p>

          <div className="flex flex-wrap gap-2 text-xs font-medium text-gray-700">
            {job.location && (
              <span className="flex items-center gap-1.5 bg-teal-100/80 px-3 py-1 rounded-full border border-teal-100">
                <FaMapMarkerAlt className="text-teal-500" /> 
                <span className="truncate max-w-[150px]">{job.location}</span>
              </span>
            )}
            <span className="flex items-center gap-1.5 bg-indigo-100/80 px-3 py-1 rounded-full border border-indigo-100">
              <FaMoneyBillWave className="text-indigo-500" /> {displaySalary()}
            </span>
            <span className="flex items-center gap-1.5 bg-orange-100/80 px-3 py-1 rounded-full border border-orange-100">
              <FaCalendarAlt className="text-orange-500" /> {postedLabel(job.datePosted)}
            </span>
            <span className="flex items-center gap-1.5 bg-purple-100/80 px-3 py-1 rounded-full border border-purple-100 capitalize">
              <FaTags className="text-purple-500" /> {job.type}
            </span>
          </div>
        </div>

        {/* 3. Actions Column */}
        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 mt-4 sm:mt-0 sm:pl-5 sm:border-l border-gray-100">
          
          {showBookmark && toggleBookmark && (
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleBookmark(job.id);
              }}
              className={`p-2.5 rounded-lg border transition-all duration-200 shadow-sm ${
                isBookmarked
                  ? 'bg-yellow-100/80 border-yellow-200 text-yellow-600'
                  : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 hover:border-yellow-200'
              }`}
              title={isBookmarked ? "Remove Bookmark" : "Save Job"}
            >
              {isBookmarked ? <FaStar className="text-lg" /> : <FaRegStar className="text-lg" />}
            </button>
          )}

          <Link
            href={jobUrl}
            onClick={trackClick}
            className="flex-1 sm:flex-none w-full sm:w-auto text-center bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ease-in-out shadow-md flex items-center justify-center gap-2"
          >
            <span>Details</span>
            <FaExternalLinkAlt className="text-xs" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
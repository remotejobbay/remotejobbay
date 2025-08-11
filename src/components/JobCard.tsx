'use client';

import Link from 'next/link';
import {
  FaRegStar,
  FaStar,
  FaMapMarkerAlt,
  FaClock,
  FaDollarSign,
} from 'react-icons/fa';
import { Job } from '@/types';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface Props {
  job: Job;
  bookmarked?: string[];
  toggleBookmark?: (id: string | number) => void;
  showBookmark?: boolean;
}

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
    const diff = Math.floor(
      (Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diff === 0) return '📅 Today';
    if (diff === 1) return '📅 1 day ago';
    return `📅 ${diff} days ago`;
  };

  const logoOk = job.logo && !logoError && job.logo.trim() !== '';

  /* Google Analytics click event */
  const trackClick = () => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'job_click', {
        event_category: 'jobs',
        event_label: `${job.title} at ${job.company}`,
        job_id: job.id,
      });
    }
  };

  /* ─────────── Render ─────────── */
  return (
    <motion.article
      whileHover={{ scale: 1.03, boxShadow: '0 8px 15px rgba(0, 0, 0, 0.1)' }}
      className="rounded-xl bg-gradient-to-br from-teal-50/80 via-indigo-50/80 to-orange-50/80 backdrop-blur-md border border-teal-200/70 p-3 grid sm:grid-cols-[40px_1fr_auto] gap-3 hover:bg-opacity-100 transition-all duration-300"
    >
      {/* Logo */}
      {logoOk ? (
        <img
          src={job.logo}
          alt={`${job.company} logo`}
          onError={() => setLogoError(true)}
          className="row-span-2 h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-full border-2 border-white shadow-sm"
        />
      ) : (
        <div className="row-span-2 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-200/80 backdrop-blur-sm flex items-center justify-center text-xs text-gray-600 font-semibold shadow-sm">
          ?
        </div>
      )}

      {/* Job title & company */}
      <div className="space-y-1">
        <Link
          href={`/jobs/${job.slug}`}
          onClick={trackClick}
          className="block focus:outline-none focus:ring-2 focus:ring-teal-400 rounded"
        >
          <h3 className="text-lg font-extrabold text-teal-800 leading-tight drop-shadow">
            {job.title}
          </h3>
          <p className="text-sm text-indigo-600 font-medium">{job.company}</p>
        </Link>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs">
          {job.location && (
            <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
              <FaMapMarkerAlt className="text-teal-500 text-xs" />
              {job.location}
            </span>
          )}
          <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
            <FaClock className="text-indigo-500 text-xs" />
            {job.type}
          </span>
          <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
            <FaDollarSign className="text-orange-500 text-xs" />
            {job.salary && Number(job.salary) > 0
              ? job.salaryType === 'hourly'
                ? `$${job.salary}/hr`
                : `$${job.salary}/yr`
              : 'Not specified'}
          </span>
          {job.category && (
            <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full shadow-sm">
              #{job.category}
            </span>
          )}
        </div>
      </div>

      {/* Bookmark & date (desktop) */}
      {showBookmark && toggleBookmark && (
        <div className="hidden sm:flex flex-col items-end justify-between gap-1">
          <button
            onClick={() => toggleBookmark(job.id)}
            className="text-yellow-500 hover:text-yellow-600 transition-colors duration-200"
            aria-label="bookmark"
          >
            {isBookmarked ? <FaStar className="text-base" /> : <FaRegStar className="text-base" />}
          </button>
          <span className="bg-teal-200/80 text-teal-900 text-xs px-2 py-0.5 rounded-full shadow-sm">
            {postedLabel(job.datePosted)}
          </span>
        </div>
      )}

      {/* Bookmark & date (mobile) */}
      {showBookmark && toggleBookmark && (
        <div className="sm:hidden flex items-center justify-between gap-1">
          <span className="bg-teal-200/80 text-teal-900 text-xs px-2 py-0.5 rounded-full shadow-sm">
            {postedLabel(job.datePosted)}
          </span>
          <button
            onClick={() => toggleBookmark(job.id)}
            className="text-yellow-500 hover:text-yellow-600 transition-colors duration-200"
            aria-label="bookmark"
          >
            {isBookmarked ? <FaStar className="text-base" /> : <FaRegStar className="text-base" />}
          </button>
        </div>
      )}
    </motion.article>
  );
}
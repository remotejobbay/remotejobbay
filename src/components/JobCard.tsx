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
      whileHover={{ scale: 1.03, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)' }}
      className="rounded-2xl bg-gradient-to-br from-teal-50/80 via-indigo-50/80 to-orange-50/80 backdrop-blur-md border border-teal-200/70 p-5 grid sm:grid-cols-[48px_1fr_auto] gap-5 hover:bg-opacity-100 transition-all duration-300"
    >
      {/* Logo */}
      {logoOk ? (
        <img
          src={job.logo}
          alt={`${job.company} logo`}
          onError={() => setLogoError(true)}
          className="row-span-2 h-12 w-12 sm:h-14 sm:w-14 object-contain rounded-full border-2 border-white shadow-md"
        />
      ) : (
        <div className="row-span-2 h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gray-200/80 backdrop-blur-sm flex items-center justify-center text-sm text-gray-600 font-semibold shadow-md">
          ?
        </div>
      )}

      {/* Job title & company */}
      <div>
        <Link
          href={`/jobs/${job.slug}`}
          onClick={trackClick}
          className="block focus:outline-none focus:ring-2 focus:ring-teal-400 rounded-lg"
        >
          <h3 className="text-xl font-extrabold text-teal-800 leading-tight drop-shadow-sm">
            {job.title}
          </h3>
          <p className="text-md text-indigo-600 mt-1 font-medium">{job.company}</p>
        </Link>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-3 text-sm">
          {job.location && (
            <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <FaMapMarkerAlt className="text-teal-500" />
              {job.location}
            </span>
          )}
          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <FaClock className="text-indigo-500" />
            {job.type}
          </span>
          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <FaDollarSign className="text-orange-500" />
            {job.salary && Number(job.salary) > 0
              ? job.salaryType === 'hourly'
                ? `$${job.salary}/hr`
                : `$${job.salary}/yr`
              : 'Not specified'}
          </span>
          {job.category && (
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full shadow-sm">
              #{job.category}
            </span>
          )}
        </div>
      </div>

      {/* Bookmark & date (desktop) */}
      {showBookmark && toggleBookmark && (
        <div className="hidden sm:flex flex-col items-end justify-between">
          <button
            onClick={() => toggleBookmark(job.id)}
            className="text-yellow-500 hover:text-yellow-600 transition-colors duration-200"
            aria-label="bookmark"
          >
            {isBookmarked ? <FaStar className="text-lg" /> : <FaRegStar className="text-lg" />}
          </button>
          <span className="mt-3 bg-teal-200/80 text-teal-900 text-xs px-3 py-1 rounded-full shadow-md">
            {postedLabel(job.datePosted)}
          </span>
        </div>
      )}

      {/* Bookmark & date (mobile) */}
      {showBookmark && toggleBookmark && (
        <div className="sm:hidden mt-3 flex justify-between items-center">
          <span className="bg-teal-200/80 text-teal-900 text-xs px-3 py-1 rounded-full shadow-md">
            {postedLabel(job.datePosted)}
          </span>
          <button
            onClick={() => toggleBookmark(job.id)}
            className="ml-2 text-yellow-500 hover:text-yellow-600 transition-colors duration-200"
            aria-label="bookmark"
          >
            {isBookmarked ? <FaStar className="text-lg" /> : <FaRegStar className="text-lg" />}
          </button>
        </div>
      )}
    </motion.article>
  );
}
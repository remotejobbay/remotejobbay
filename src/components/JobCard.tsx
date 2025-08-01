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
    if (diff === 1) return '📅 1 day ago';
    return `📅 ${diff} days ago`;
  };

  const logoOk = job.logo && !logoError && job.logo.trim() !== '';

  /* Google Analytics click event */
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
      whileHover={{ scale: 1.015 }}
      className="rounded-3xl bg-yellow-100/70 border border-yellow-300/70 p-4 sm:p-5
                 grid sm:grid-cols-[48px_1fr_auto] gap-4 hover:shadow-xl
                 transition-all duration-300"
    >
      {/* Logo */}
      {logoOk ? (
        <img
          src={job.logo}
          alt={`${job.company} logo`}
          onError={() => setLogoError(true)}
          className="row-span-2 h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-full border bg-white"
        />
      ) : (
        <div className="row-span-2 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500 font-semibold">
          ?
        </div>
      )}

      {/* Job title & company */}
      <div>
        <Link
          href={`/jobs/${job.slug}`}
          onClick={trackClick}
          className="block focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
        >
          <h3 className="font-extrabold text-fuchsia-700 leading-snug">
            {job.title}
          </h3>
          <p className="text-fuchsia-500 text-sm mt-0.5">{job.company}</p>
        </Link>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 text-xs">
          {job.location && (
            <span className="badge-green">
              <FaMapMarkerAlt className="icon-xs" />
              {job.location}
            </span>
          )}
          <span className="badge-yellow">
            <FaClock className="icon-xs" />
            {job.type}
          </span>
          <span className="badge-blue">
            <FaDollarSign className="icon-xs" />
            {job.salary && Number(job.salary) > 0
              ? job.salaryType === 'hourly'
                ? `$${job.salary}/hr`
                : `$${job.salary}/yr`
              : 'Not specified'}
          </span>
          {job.category && (
            <span className="badge-purple">#{job.category}</span>
          )}
        </div>
      </div>

      {/* Bookmark & date (desktop) */}
      {showBookmark && toggleBookmark && (
        <div className="hidden sm:flex flex-col items-end justify-between">
          <button
            onClick={() => toggleBookmark(job.id)}
            className="text-yellow-500 hover:text-yellow-600"
            aria-label="bookmark"
          >
            {isBookmarked ? <FaStar /> : <FaRegStar />}
          </button>
          <span className="mt-3 bg-blue-200 text-blue-900 text-[11px] px-2 py-0.5 rounded-full">
            {postedLabel(job.datePosted)}
          </span>
        </div>
      )}

      {/* Bookmark & date (mobile) */}
      {showBookmark && toggleBookmark && (
        <div className="sm:hidden mt-3 flex justify-between items-center">
          <span className="bg-blue-200 text-blue-900 text-[11px] px-2 py-0.5 rounded-full">
            {postedLabel(job.datePosted)}
          </span>
          <button
            onClick={() => toggleBookmark(job.id)}
            className="ml-auto text-yellow-500 hover:text-yellow-600"
            aria-label="bookmark"
          >
            {isBookmarked ? <FaStar /> : <FaRegStar />}
          </button>
        </div>
      )}
    </motion.article>
  );
}

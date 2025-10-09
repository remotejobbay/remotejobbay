'use client';

import Link from 'next/link';
import {
  FaRegStar,
  FaStar,
  FaMapMarkerAlt,
  FaClock,
  FaDollarSign,
  FaBuilding,
  FaExternalLinkAlt,
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
    if (diff === 0) return 'Today';
    if (diff === 1) return '1 day ago';
    if (diff < 7) return `${diff} days ago`;
    if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
    return `${Math.floor(diff / 30)}mo ago`;
  };

  const isNewJob = (d: string) => {
    const diff = Math.floor(
      (Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24),
    );
    return diff <= 3;
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
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)' }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative rounded-2xl bg-white border border-gray-100 p-6 hover:border-teal-200/60 transition-all duration-300 shadow-sm hover:shadow-xl"
    >
      {/* Premium badge for new jobs */}
      {isNewJob(job.datePosted) && (
        <div className="absolute -top-2 -left-2">
          <span className="bg-gradient-to-r from-teal-500 to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            NEW
          </span>
        </div>
      )}

      <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-start">
        {/* Logo with premium styling */}
        <div className="relative">
          {logoOk ? (
            <div className="relative">
              <img
                src={job.logo}
                alt={`${job.company} logo`}
                onError={() => setLogoError(true)}
                className="h-14 w-14 object-contain rounded-xl border-2 border-white shadow-lg ring-2 ring-gray-50"
              />
              <div className="absolute inset-0 rounded-xl ring-1 ring-black/5" />
            </div>
          ) : (
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 backdrop-blur-sm flex items-center justify-center shadow-lg ring-2 ring-gray-50">
              <FaBuilding className="text-gray-400 text-lg" />
            </div>
          )}
        </div>

        {/* Job content */}
        <div className="space-y-3 min-w-0">
          {/* Title & Company */}
          <div className="space-y-2">
            <Link
              href={`/jobs/${job.slug}`}
              onClick={trackClick}
              className="block focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 rounded-lg transition-all duration-200"
            >
              <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-teal-700 transition-colors line-clamp-2">
                {job.title}
              </h3>
            </Link>
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold text-gray-700">{job.company}</p>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-md">
                {postedLabel(job.datePosted)}
              </span>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {job.location && (
              <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm font-medium border border-blue-100">
                <FaMapMarkerAlt className="text-blue-500 text-xs flex-shrink-0" />
                <span className="truncate">{job.location}</span>
              </span>
            )}
            <span className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm font-medium border border-purple-100">
              <FaClock className="text-purple-500 text-xs flex-shrink-0" />
              {job.type}
            </span>
            <span className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm font-medium border border-amber-100">
              <FaDollarSign className="text-amber-500 text-xs flex-shrink-0" />
              {job.salary && Number(job.salary) > 0
                ? job.salaryType === 'hourly'
                  ? `$${Number(job.salary).toLocaleString()}/hr`
                  : `$${Number(job.salary).toLocaleString()}/yr`
                : 'Salary not specified'}
            </span>
            {job.category && (
              <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200">
                #{job.category}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col items-end gap-3">
          {showBookmark && toggleBookmark && (
            <button
              onClick={() => toggleBookmark(job.id)}
              className={`p-2 rounded-xl border transition-all duration-200 ${
                isBookmarked
                  ? 'bg-amber-50 border-amber-200 text-amber-500 hover:bg-amber-100'
                  : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-amber-400'
              }`}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              {isBookmarked ? (
                <FaStar className="text-lg" />
              ) : (
                <FaRegStar className="text-lg" />
              )}
            </button>
          )}
          
          <Link
            href={`/jobs/${job.slug}`}
            onClick={trackClick}
            className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:from-teal-600 hover:to-blue-600 transition-all duration-200 shadow-md hover:shadow-lg group/btn"
          >
            View Job
            <FaExternalLinkAlt className="text-xs group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Enhanced hover effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-teal-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.article>
  );
}
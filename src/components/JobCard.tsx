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
  FaBriefcase,
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
      (Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff === 0) return 'Today';
    if (diff === 1) return '1 day ago';
    if (diff < 7) return `${diff} days ago`;
    if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
    return `${Math.floor(diff / 30)}mo ago`;
  };

  const isNewJob = (d: string) => {
    const diff = Math.floor(
      (Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff <= 3;
  };

  const logoOk = job.logo && !logoError && job.logo.trim() !== '';

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="group relative bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm hover:shadow-xl hover:border-teal-200 transition-all duration-300"
    >
      {/* "New" Badge - Floated absolutely */}
      {isNewJob(job.datePosted) && (
        <div className="absolute -top-3 -left-2 z-10">
          <span className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full shadow-md border border-white">
            New
          </span>
        </div>
      )}

      {/* Main Layout: Flex Col on Mobile, Flex Row on Desktop */}
      <div className="flex flex-col md:flex-row gap-5">
        
        {/* 1. Header Section: Logo & Basic Info */}
        <div className="flex flex-row md:flex-col items-start gap-4 flex-shrink-0">
          <div className="relative">
            {logoOk ? (
              <img
                src={job.logo}
                alt={`${job.company} logo`}
                onError={() => setLogoError(true)}
                className="h-12 w-12 md:h-14 md:w-14 object-contain rounded-lg border border-gray-100 bg-white shadow-sm p-0.5"
              />
            ) : (
              <div className="h-12 w-12 md:h-14 md:w-14 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 shadow-inner">
                <FaBuilding className="text-gray-300 text-xl" />
              </div>
            )}
          </div>
          
          {/* Mobile Only: Company Name next to logo (saves vertical space) */}
          <div className="md:hidden flex-1 min-w-0 pt-1">
             <p className="text-sm font-semibold text-gray-500 truncate">
                {job.company}
             </p>
             <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                {postedLabel(job.datePosted)}
             </p>
          </div>
        </div>

        {/* 2. Content Body: Grows to fill space */}
        <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
          <div>
            <div className="flex justify-between items-start gap-2">
              <Link
                href={`/jobs/${job.slug}`}
                onClick={trackClick}
                className="group/link focus:outline-none"
              >
                <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-snug group-hover/link:text-teal-600 transition-colors">
                  {job.title}
                </h3>
              </Link>
            </div>

            {/* Desktop: Company info sits here */}
            <div className="hidden md:flex items-center gap-2 mt-1.5 text-sm text-gray-500">
              <span className="font-semibold text-gray-700">{job.company}</span>
              <span>•</span>
              <span className="text-gray-400">{postedLabel(job.datePosted)}</span>
            </div>
          </div>

          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {job.location && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600 border border-gray-100">
                <FaMapMarkerAlt className="text-gray-400" />
                <span className="truncate max-w-[150px]">{job.location}</span>
              </div>
            )}
            
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
              <FaClock className="text-purple-400" />
              {job.type}
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-100">
              <FaDollarSign className="text-green-500" />
              {job.salary && Number(job.salary) > 0
                ? job.salaryType === 'hourly'
                  ? `${Number(job.salary).toLocaleString()}/hr`
                  : `${Number(job.salary).toLocaleString()}/yr`
                : 'Competitive'}
            </div>
          </div>
        </div>

        {/* 3. Actions Column: Buttons */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 md:pl-4 md:border-l md:border-gray-50 mt-2 md:mt-0">
          
          {/* Bookmark Button */}
          {showBookmark && toggleBookmark && (
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleBookmark(job.id);
              }}
              className={`p-2.5 rounded-xl border transition-all duration-200 hover:shadow-md ${
                isBookmarked
                  ? 'bg-amber-50 border-amber-200 text-amber-500'
                  : 'bg-white border-gray-200 text-gray-400 hover:text-amber-500 hover:border-amber-200'
              }`}
              title={isBookmarked ? 'Remove bookmark' : 'Save job'}
            >
              {isBookmarked ? <FaStar /> : <FaRegStar />}
            </button>
          )}

          {/* View Job Button - Full width on mobile */}
          <Link
            href={`/jobs/${job.slug}`}
            onClick={trackClick}
            className="flex-1 md:flex-none w-full md:w-auto text-center bg-gray-900 hover:bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <span>Details</span>
            <FaExternalLinkAlt className="text-xs opacity-70" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
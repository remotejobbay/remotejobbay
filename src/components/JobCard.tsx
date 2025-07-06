'use client';

import Link from 'next/link';
import {
  FaRegStar, FaStar, FaMapMarkerAlt, FaClock,
  FaDollarSign,
} from 'react-icons/fa';
import { Job } from '@/types';
import { motion } from 'framer-motion';

interface Props {
  job: Job;
  bookmarked?: string[];
  toggleBookmark?: (id: string | number) => void;
  showBookmark?: boolean;
}

export default function JobCard({ job, bookmarked = [], toggleBookmark, showBookmark = true }: Props) {
  const isBookmarked = bookmarked.includes(String(job.id));

  const getPostedLabel = (datePosted: string) => {
    const jobDate = new Date(datePosted);
    const today = new Date();
    const diffTime = today.getTime() - jobDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return '📅 Today';
    if (diffDays === 1) return '📅 1 day ago';
    return `📅 ${diffDays} days ago`;
  };

  return (
    <motion.div
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-yellow-100 border border-yellow-300 hover:shadow-xl hover:-translate-y-1 hover:ring-2 hover:ring-yellow-400 transform transition-all duration-300"
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center gap-4 w-full">
        {job.logo && job.logo.trim() !== '' && (
          <img
            src={job.logo}
            alt={`${job.company} logo`}
            className="w-12 h-12 object-cover rounded-full border"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}

        <div className="flex-1 min-w-0">
          <Link href={`/jobs/${job.id}`} className="block">
            <h3 className="text-base sm:text-lg font-bold text-fuchsia-700 hover:underline">
              {job.title}
            </h3>
            <p className="text-sm text-fuchsia-500 truncate">{job.company}</p>
          </Link>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
            <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full flex items-center gap-1">
              <FaMapMarkerAlt className="text-xs" /> Anywhere
            </span>
            <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full flex items-center gap-1">
              <FaClock className="text-xs" /> {job.type}
            </span>
            <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full flex items-center gap-1">
              <FaDollarSign className="text-xs" />
              {job.salary
                ? job.salaryType === 'hourly'
                  ? `$${job.salary}/hr`
                  : `$${job.salary}/yr`
                : 'Not specified'}
            </span>
            {job.category && (
              <span className="bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                #{job.category}
              </span>
            )}
          </div>
        </div>

        {showBookmark && toggleBookmark && (
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={() => toggleBookmark(job.id)}
              className="text-yellow-500 hover:text-yellow-600"
            >
              {isBookmarked ? <FaStar className="w-4 h-4" /> : <FaRegStar className="w-4 h-4" />}
            </button>
            <span className="text-[10px] font-medium bg-blue-200 text-blue-900 px-2 py-1 rounded-full">
              {getPostedLabel(job.datePosted)}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

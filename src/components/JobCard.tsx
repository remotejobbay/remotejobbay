'use client';

/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import {
  FaRegStar,
  FaStar,
  FaMapMarkerAlt,
  FaBriefcase,
  FaTag, 
} from 'react-icons/fa';
import { Job } from '@/types';
import { motion } from 'framer-motion';
import { useState } from 'react';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

interface Props {
  job: Job;
  bookmarked?: string[];
  toggleBookmark?: (id: string | number) => void;
  showBookmark?: boolean;
}

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

  const postedLabel = (d: string) => {
    try {
      const diff = Math.floor((Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24));
      if (isNaN(diff)) return 'Recently';
      if (diff <= 0) return 'Today';
      if (diff === 1) return '1 day ago';
      if (diff < 7) return `${diff} days ago`;
      return `${Math.floor(diff / 7)}w ago`;
    } catch {
      return 'Recently';
    }
  };

  const displaySalary = () => {
    if (
      !job.salary || 
      job.salary === '0' || 
      String(job.salary).toLowerCase() === 'not listed'
    ) {
      return 'Competitive';
    }
    
    if (typeof job.salary === 'string' && isNaN(Number(job.salary))) {
      return job.salary;
    }
    
    const amount = Number(job.salary).toLocaleString();
    return job.salaryType === 'hourly' ? `$${amount}/hr` : `$${amount}/yr`;
  };

  const jobUrl = generateJobUrl(job.title, job.id);

  const salaryText = displaySalary();
  const salaryClass =
    salaryText === 'Competitive' ? 'text-amber-700' : 'text-slate-800';

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group bg-white p-5 rounded-[8px] shadow-[0_4px_6px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_15px_rgba(0,0,0,0.1)] hover:-translate-y-[3px] transition-all duration-300 cursor-pointer border border-transparent"
    >
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-5 items-start">
        
        {/* 1. Job Logo & Mobile Date */}
        <div className="flex justify-between items-start w-full md:w-auto">
          <div className="flex-shrink-0">
            {!logoError && job.logo ? (
              <img
                src={job.logo}
                alt={job.company}
                onError={() => setLogoError(true)}
                className="w-[60px] h-[60px] rounded-[8px] object-cover"
              />
            ) : (
              <div className="w-[60px] h-[60px] flex items-center justify-center bg-[#dbeafe] text-[#2563eb] rounded-[8px] font-bold text-xl">
                {job.company.charAt(0)}
              </div>
            )}
          </div>
          
          {/* Mobile-only Date (Opposite Logo) */}
          <span className="md:hidden text-[#6b7280] text-[0.85rem] mt-1">
            {postedLabel(job.datePosted)}
          </span>
        </div>

        {/* 2. Job Info */}
        <div className="min-w-0">
          <Link href={jobUrl}>
            <h3 className="text-[1.1rem] font-bold text-[#1f2937] mb-1 group-hover:text-[#2563eb] transition-colors leading-tight">
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

        {/* 3. Job Actions */}
        <div className="flex flex-row md:flex-col justify-between items-center md:items-end h-full gap-2">
          <div className={`font-bold text-[1rem] whitespace-nowrap ${salaryClass}`}>
            {salaryText}
          </div>
          
          <div className="flex items-center gap-3">
            {showBookmark && toggleBookmark && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleBookmark(job.id);
                }}
                className={`text-xl transition-colors ${
                  isBookmarked ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-500'
                }`}
              >
                {isBookmarked ? <FaStar /> : <FaRegStar />}
              </button>
            )}
            
            <Link
              href={jobUrl}
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-[8px] font-semibold text-[0.95rem] transition-colors"
            >
              Details
            </Link>
          </div>
          
          {/* Desktop-only Date */}
          <span className="hidden md:block text-[#6b7280] text-[0.85rem] mt-auto">
            {postedLabel(job.datePosted)}
          </span>
        </div>
      </div>
    </motion.article>
  );
}

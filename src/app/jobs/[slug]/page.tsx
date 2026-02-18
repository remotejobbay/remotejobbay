'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FaStar,
  FaRegStar,
  FaBriefcase,
  FaBuilding,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaTags,
} from 'react-icons/fa';
import { Job } from '@/types';
import EmailSubscription from '@/components/EmailSubscription';
import { supabase } from '@/utils/supabase/supabaseClient';
import { motion } from 'framer-motion';

export default function JobDetail() {
  const { slug } = useParams(); 
  const [job, setJob] = useState<Job | null>(null);
  const [bookmarked, setBookmarked] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [similarJobs, setSimilarJobs] = useState<Job[]>([]);
  const [logoError, setLogoError] = useState(false);

  // --- 1. NORMALIZATION: Map your specific DB columns to the UI ---
  const normalizeJobData = (rawJob: any): Job => {
    // Logic to determine the best salary string
    let finalSalary = 'Not specified';
    if (rawJob.salary_text && rawJob.salary_text !== 'Not Listed') {
        finalSalary = rawJob.salary_text;
    } else if (rawJob.salary && rawJob.salary !== '0' && rawJob.salary !== 0 && rawJob.salary !== 'Not Listed') {
        finalSalary = rawJob.salary; // e.g. "$50k"
    } else if (rawJob.salaryType && rawJob.salaryType !== 'None') {
        finalSalary = rawJob.salaryType; // e.g. "Negotiable"
    }

    return {
      ...rawJob,
      // Map IDs
      id: rawJob.id, // Both tables use 'id'
      
      // Map Text Fields
      title: rawJob.title,
      company: rawJob.company || 'Unknown Company',
      location: rawJob.location || 'Remote',
      description: rawJob.description || 'No description available.',
      
      // Map URLs (Handle snake_case vs camelCase)
      logo: rawJob.logo, 
      applyUrl: rawJob.applyUrl || rawJob.apply_url, // 'jobs' uses applyUrl, 'potential' uses apply_url
      
      // Map Dates
      datePosted: rawJob.datePosted || rawJob.created_at,
      
      // Map Metadata
      salary: finalSalary,
      type: rawJob.type || 'Full-Time', // 'potential_jobs' might be missing this, default to Full-Time
      category: rawJob.category || 'General',
    };
  };

  useEffect(() => {
    async function fetchJobAndSimilar() {
      if (!slug) return;
      setLoading(true);

      try {
        let foundJob = null;
        let sourceTable = '';

        // Check if the URL param is a Number (ID) or Text (Slug)
        const isNumericId = !isNaN(Number(slug));

        if (isNumericId) {
          // --- SCENARIO A: It's an ID (e.g., 349 or 803) ---
          
          // 1. Priority: Check 'jobs' table first (Verified jobs)
          let { data: manualData } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', slug)
            .maybeSingle();

          if (manualData) {
            foundJob = normalizeJobData(manualData);
            sourceTable = 'jobs';
          } else {
            // 2. Fallback: Check 'potential_jobs' table
            // ✅ CHANGE: Added .eq('status', 'approved') filter
            const { data: potentialData } = await supabase
              .from('potential_jobs')
              .select('*')
              .eq('id', slug)
              .eq('status', 'approved') 
              .maybeSingle();

            if (potentialData) {
              foundJob = normalizeJobData(potentialData);
              sourceTable = 'potential_jobs';
            }
          }
        } else {
          // --- SCENARIO B: It's a Text Slug (e.g., "software-engineer") ---
          // Only the 'jobs' table has a 'slug' column in your schema
          const { data: slugData } = await supabase
            .from('jobs')
            .select('*')
            .eq('slug', slug)
            .maybeSingle();

          if (slugData) {
            foundJob = normalizeJobData(slugData);
            sourceTable = 'jobs';
          }
        }

        // --- VALIDATION ---
        if (!foundJob || !foundJob.applyUrl) {
          setJob(null);
          return;
        }

        setJob(foundJob);

        // Analytics
        if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
          window.gtag('event', 'job_view', {
            event_category: 'jobs',
            event_label: `${foundJob.title} at ${foundJob.company}`,
            job_id: foundJob.id,
          });
        }

        // --- FETCH SIMILAR JOBS ---
        // ✅ CHANGE: Built a query object to conditionally filter by status
        let similarQuery = supabase
          .from(sourceTable) 
          .select('*')
          .neq('id', foundJob.id)
          .eq('category', foundJob.category);

        // If pulling from potential_jobs, ONLY show approved ones
        if (sourceTable === 'potential_jobs') {
            similarQuery = similarQuery.eq('status', 'approved');
        }

        const { data: relatedRaw } = await similarQuery.limit(4);

        if (relatedRaw) {
          const normalizedSimilar = relatedRaw
            .map(normalizeJobData)
            .filter(j => j.applyUrl && j.applyUrl.trim() !== '');
          setSimilarJobs(normalizedSimilar);
        }

      } catch (error) {
        console.error('Error fetching job details:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchJobAndSimilar();
  }, [slug]);

  // Bookmark Logic
  useEffect(() => {
    const saved = localStorage.getItem('bookmarkedJobs');
    if (saved) {
      setBookmarked(JSON.parse(saved));
    }
  }, []);

  const toggleBookmark = () => {
    if (!job) return;
    const idStr = String(job.id);
    const updated = bookmarked.includes(idStr)
      ? bookmarked.filter(b => b !== idStr)
      : [...bookmarked, idStr];

    setBookmarked(updated);
    localStorage.setItem('bookmarkedJobs', JSON.stringify(updated));
  };

  const handleApplyClick = () => {
    if (!job) return;
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'job_apply', {
        event_category: 'jobs',
        event_label: `${job.title} at ${job.company}`,
        job_id: job.id,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent mb-4"></div>
              <p className="text-gray-500 font-medium">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Job Not Found</h2>
            <p className="text-gray-600 mb-6">The job you are looking for may have expired or been removed.</p>
            <Link href="/" className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition">
                Browse All Jobs
            </Link>
        </div>
      </div>
    );
  }

  const shouldShowLogo = job.logo && job.logo.trim() !== '' && !logoError;

  // Split description into paragraphs and sanitize basic issues
  const paragraphs = job.description?.trim()
    ? job.description.split('\n').map((para) => para.trim()).filter(para => para.length > 0)
    : ['No description provided.'];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-teal-50/80 via-indigo-50/80 to-orange-50/80 backdrop-blur-md min-h-screen">
      <Link
        href="/"
        className="text-teal-600 hover:text-teal-700 font-poppins text-sm mb-6 inline-flex items-center gap-2 transition-colors duration-200"
      >
        <span>←</span> Back to job listings
      </Link>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/50"
          >
            <div className="flex flex-col sm:flex-row items-start gap-5 mb-6">
              {shouldShowLogo ? (
                <img
                  src={job.logo}
                  alt={`${job.company} logo`}
                  className="w-20 h-20 object-contain rounded-xl bg-white p-1 border border-gray-100 shadow-sm"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="w-20 h-20 flex items-center justify-center bg-teal-100 rounded-xl text-teal-600 font-bold text-3xl shadow-sm">
                    {job.company.charAt(0)}
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-extrabold text-gray-900 font-poppins mb-2">
                  {job.title}
                </h1>
                <p className="text-xl text-teal-600 font-semibold font-poppins mb-4">
                  {job.company}
                </p>
                
                <div className="flex flex-wrap gap-3 text-sm font-medium">
                  <span className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200">
                    <FaMapMarkerAlt className="text-teal-500" /> {job.location}
                  </span>
                  <span className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200">
                    <FaMoneyBillWave className="text-indigo-500" /> {job.salary}
                  </span>
                  <span className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200">
                    <FaCalendarAlt className="text-orange-500" /> {new Date(job.datePosted).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 capitalize">
                    <FaTags className="text-purple-500" /> {job.type}
                  </span>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="prose prose-teal max-w-none text-gray-700 mb-8"
            >
               <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">About the Job</h3>
                  {paragraphs.map((para, index) => (
                    <p key={index} className="mb-4 leading-relaxed text-gray-700 last:mb-0">
                      {para}
                    </p>
                  ))}
               </div>
            </motion.div>

            {/* Found on RemoteJobBay Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gradient-to-r from-teal-50 to-indigo-50 border border-teal-100 p-6 rounded-xl mb-8 text-center"
            >
              <h2 className="text-lg font-bold text-teal-800 mb-2 flex items-center justify-center gap-2">
                <FaBriefcase /> Found on RemoteJobBay?
              </h2>
              <p className="text-gray-600 text-sm">
                Mention <strong>RemoteJobBay</strong> in your application to help us connect you with more opportunities!
              </p>
            </motion.div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-gray-100">
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleApplyClick}
                className={`w-full sm:w-auto text-center px-8 py-3 rounded-xl shadow-lg text-white font-semibold transition-all transform hover:-translate-y-0.5 ${
                  job.applyUrl 
                  ? 'bg-gradient-to-r from-teal-500 to-indigo-600 hover:shadow-teal-500/30' 
                  : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Apply Now 
              </a>
              <button
                onClick={toggleBookmark}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border-2 border-gray-200 hover:border-teal-200 hover:bg-teal-50 text-gray-600 hover:text-teal-700 font-semibold flex items-center justify-center gap-2 transition-all"
              >
                {bookmarked.includes(String(job.id)) ? <FaStar className="text-yellow-400" /> : <FaRegStar />}
                {bookmarked.includes(String(job.id)) ? 'Saved' : 'Save Job'}
              </button>
            </div>
          </motion.div>

          {/* Similar Jobs Section */}
          {similarJobs.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 px-1">Similar Opportunities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {similarJobs.map((sim, i) => (
                  <motion.div
                    key={sim.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="group bg-white p-5 rounded-xl border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all"
                  >
                    <Link href={`/jobs/${sim.id}`} className="block"> 
                      <h3 className="font-bold text-gray-800 group-hover:text-teal-600 transition-colors line-clamp-1">
                        {sim.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{sim.company}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                          <span>{new Date(sim.datePosted).toLocaleDateString()}</span>
                          <span className="flex-1 text-right">{sim.location}</span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          <div className="mt-8">
            <EmailSubscription />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="mt-8 md:mt-0 md:sticky md:top-6 md:h-fit">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white/80 backdrop-blur-md border border-indigo-50 p-6 rounded-xl shadow-lg space-y-6"
          >
            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3">
              Job Overview
            </h2>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                    <FaBriefcase className="text-teal-600 text-sm" />
                </div>
                <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Position</p>
                    <p className="text-sm font-medium text-gray-800">{job.title}</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <FaBuilding className="text-indigo-600 text-sm" />
                </div>
                <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Company</p>
                    <p className="text-sm font-medium text-gray-800">{job.company}</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                    <FaMapMarkerAlt className="text-orange-600 text-sm" />
                </div>
                <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Location</p>
                    <p className="text-sm font-medium text-gray-800">{job.location}</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <FaTags className="text-purple-600 text-sm" />
                </div>
                <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Type</p>
                    <p className="text-sm font-medium text-gray-800 capitalize">{job.type}</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                    <FaMoneyBillWave className="text-green-600 text-sm" />
                </div>
                <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Salary</p>
                    <p className="text-sm font-medium text-gray-800">{job.salary}</p>
                </div>
              </li>
            </ul>
          </motion.div>
        </aside>
      </div>
    </main>
  );
}
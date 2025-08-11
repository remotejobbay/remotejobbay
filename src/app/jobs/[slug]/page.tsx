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

  useEffect(() => {
    async function fetchJobAndSimilar() {
      try {
        const { data: currentJob, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error || !currentJob || !currentJob.applyUrl || currentJob.applyUrl.trim() === '') {
          setJob(null);
          return;
        }

        setJob(currentJob);

        if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
          window.gtag('event', 'job_view', {
            event_category: 'jobs',
            event_label: `${currentJob.title} at ${currentJob.company}`,
            job_id: currentJob.id,
          });
        }

        const { data: allJobs } = await supabase
          .from('jobs')
          .select('*')
          .neq('id', currentJob.id)
          .eq('category', currentJob.category)
          .limit(5);

        setSimilarJobs((allJobs || []).filter(j => j.applyUrl && j.applyUrl.trim() !== ''));
      } catch (error) {
        console.error('Error fetching job or similar jobs:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchJobAndSimilar();
  }, [slug]);

  useEffect(() => {
    const saved = localStorage.getItem('bookmarkedJobs');
    if (saved) {
      setBookmarked(JSON.parse(saved));
    }
  }, []);

  const toggleBookmark = () => {
    if (!job) return;
    const idStr = String(job.id);
    let updated = [...bookmarked];

    if (bookmarked.includes(idStr)) {
      updated = updated.filter(b => b !== idStr);
    } else {
      updated.push(idStr);
    }

    setBookmarked(updated);
    localStorage.setItem('bookmarkedJobs', JSON.stringify(updated));
  };

  const formatSalary = () => {
    if (!job) return '';
    if (!job.salary || Number(job.salary) === 0) return 'Not specified';
    return job.salaryType === 'hourly' ? `$${job.salary}/hr` : `$${job.salary}/yr`;
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
      <div className="p-6 text-center text-gray-500 font-medium">Loading job details...</div>
    );
  }

  if (!job || !job.id) {
    return (
      <div className="p-6 text-center text-red-500 font-semibold">
        Job not found or failed to load.
      </div>
    );
  }

  const shouldShowLogo = job.logo && job.logo.trim() !== '' && !logoError;

  // Split description into paragraphs
  const paragraphs = job.description?.trim()
    ? job.description.split('\n').map((para, index) => para.trim()).filter(para => para.length > 0)
    : ['No description provided.'];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-teal-50/80 via-indigo-50/80 to-orange-50/80 backdrop-blur-md min-h-screen">
      <Link
        href="/"
        className="text-teal-600 hover:text-teal-700 font-poppins text-sm mb-6 inline-block transition-colors duration-200"
      >
        ← Back to job listings
      </Link>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg"
          >
            <div className="flex flex-col sm:flex-row items-start gap-5 mb-6">
              {shouldShowLogo && (
                <img
                  src={job.logo}
                  alt={job.company}
                  className="w-20 h-20 object-contain rounded-full border-2 border-teal-100 shadow-md"
                  onError={() => setLogoError(true)}
                />
              )}
              <div>
                <h1 className="text-3xl font-extrabold text-teal-800 font-poppins mb-2 drop-shadow-sm">
                  {job.title}
                </h1>
                <p className="text-lg text-indigo-600 font-semibold font-poppins mb-3">
                  {job.company}
                </p>
                <div className="flex flex-wrap gap-3 text-sm text-gray-700">
                  <span className="flex items-center gap-2 bg-teal-100/80 px-3 py-1 rounded-full">
                    <FaMapMarkerAlt className="text-teal-500" /> {job.location}
                  </span>
                  <span className="flex items-center gap-2 bg-indigo-100/80 px-3 py-1 rounded-full">
                    <FaMoneyBillWave className="text-indigo-500" /> {formatSalary()}
                  </span>
                  <span className="flex items-center gap-2 bg-orange-100/80 px-3 py-1 rounded-full">
                    <FaCalendarAlt className="text-orange-500" /> {new Date(job.datePosted).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-2 bg-purple-100/80 px-3 py-1 rounded-full capitalize">
                    <FaTags className="text-purple-500" /> {job.type}
                  </span>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-gray-50/90 p-6 rounded-xl shadow-inner text-base leading-relaxed text-gray-800 mb-8 space-y-4"
            >
              {paragraphs.map((para, index) => (
                <p key={index} className="mb-4 last:mb-0">
                  {para}
                </p>
              ))}
            </motion.div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
              <button
                onClick={toggleBookmark}
                className="bg-yellow-100/80 text-yellow-700 px-4 py-2 rounded-lg hover:bg-yellow-200 flex items-center gap-2 shadow-md transition-colors duration-200"
              >
                {bookmarked.includes(String(job.id)) ? <FaStar /> : <FaRegStar />}
                {bookmarked.includes(String(job.id)) ? 'Bookmarked' : 'Save Job'}
              </button>
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleApplyClick}
                className={`px-6 py-2 rounded-lg shadow-md text-white transition-colors duration-200 ease-in-out ${
                  job.applyUrl ? 'bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700' : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Apply Now
              </a>
            </div>
          </motion.div>

          {similarJobs.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-teal-800 font-poppins mb-5">Similar Jobs</h2>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {similarJobs.map(sim => (
                    <motion.div
                      key={sim.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * similarJobs.indexOf(sim) }}
                      className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200"
                    >
                      <Link href={`/jobs/${sim.slug}`} className="text-teal-600 font-medium hover:underline">
                        {sim.title}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">{sim.company}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(sim.datePosted).toLocaleDateString()}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          )}

          <EmailSubscription />
        </div>

        <aside className="mt-8 md:mt-0 md:sticky md:top-24 md:h-fit">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gradient-to-br from-yellow-100/80 to-orange-100/80 backdrop-blur-md border border-yellow-200 p-5 rounded-xl shadow-lg space-y-4"
          >
            <h2 className="text-xl font-bold text-yellow-800 font-poppins flex items-center gap-2">
              <FaBriefcase className="text-yellow-600" /> Job Summary
            </h2>
            <ul className="text-sm text-yellow-900 space-y-3">
              <li className="flex items-center gap-3 bg-white/50 p-2 rounded-lg shadow-sm">
                <FaBriefcase className="text-yellow-600" /> <strong className="w-24">Position:</strong> {job.title}
              </li>
              <li className="flex items-center gap-3 bg-white/50 p-2 rounded-lg shadow-sm">
                <FaBuilding className="text-yellow-600" /> <strong className="w-24">Company:</strong> {job.company}
              </li>
              <li className="flex items-center gap-3 bg-white/50 p-2 rounded-lg shadow-sm">
                <FaMapMarkerAlt className="text-yellow-600" /> <strong className="w-24">Location:</strong> {job.location}
              </li>
              <li className="flex items-center gap-3 bg-white/50 p-2 rounded-lg shadow-sm">
                <FaTags className="text-yellow-600" /> <strong className="w-24">Type:</strong> {job.type}
              </li>
              <li className="flex items-center gap-3 bg-white/50 p-2 rounded-lg shadow-sm">
                <FaMoneyBillWave className="text-yellow-600" /> <strong className="w-24">Salary:</strong> {formatSalary()}
              </li>
              <li className="flex items-center gap-3 bg-white/50 p-2 rounded-lg shadow-sm">
                <FaCalendarAlt className="text-yellow-600" /> <strong className="w-24">Posted:</strong> {new Date(job.datePosted).toLocaleDateString()}
              </li>
              <li className="flex items-center gap-3 bg-white/50 p-2 rounded-lg shadow-sm">
                <FaTags className="text-yellow-600" /> <strong className="w-24">Category:</strong> {job.category}
              </li>
            </ul>
          </motion.div>
        </aside>
      </div>
    </main>
  );
}
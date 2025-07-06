'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FaStar, FaRegStar, FaBriefcase, FaBuilding,
  FaMapMarkerAlt, FaMoneyBillWave, FaCalendarAlt, FaTags
} from 'react-icons/fa';
import { Job } from '@/types';
import EmailSubscription from '@/components/EmailSubscription';
import { supabase } from '@/utils/supabase/supabaseClient';
import { motion } from 'framer-motion';

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [bookmarked, setBookmarked] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [similarJobs, setSimilarJobs] = useState<Job[]>([]);

  useEffect(() => {
    async function fetchJobAndSimilar() {
      try {
        const { data: currentJob, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !currentJob || !currentJob.applyUrl || currentJob.applyUrl.trim() === '') {
          setJob(null);
          return;
        }

        setJob(currentJob);

        const { data: allJobs } = await supabase
          .from('jobs')
          .select('*')
          .neq('id', currentJob.id)
          .eq('category', currentJob.category)
          .limit(5);

        setSimilarJobs((allJobs || []).filter(j => j.applyUrl && j.applyUrl.trim() !== ''));
      } catch (error) {
        console.error("Error fetching job or similar jobs:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchJobAndSimilar();
  }, [id]);

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

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading job...</div>;
  }

  if (!job || !job.id) {
    return (
      <div className="p-6 text-center text-red-500 font-semibold">
        Job not found or failed to load.
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <Link href="/" className="text-blue-500 hover:underline text-sm mb-4 inline-block">
        ← Back to job listings
      </Link>

      <div className="grid md:grid-cols-3 gap-10">
        {/* MAIN JOB INFO */}
        <div className="md:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col sm:flex-row items-start gap-4 mb-6"
          >
            {job.logo && (
              <img
                src={job.logo}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/default-logo.png';
                }}
                alt={job.company}
                className="w-20 h-20 object-contain rounded-full border bg-white p-2 shadow"
              />
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{job.title}</h1>
              <p className="text-base sm:text-lg text-gray-600">{job.company}</p>
              <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full"><FaMapMarkerAlt /> Anywhere</span>
                <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full"><FaMoneyBillWave /> {job.salaryType === 'hourly' ? `$${job.salary}/hr` : `$${job.salary}/yr`}</span>
                <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full"><FaCalendarAlt /> {new Date(job.datePosted).toLocaleDateString()}</span>
                <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full capitalize"><FaTags /> {job.type}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-50 p-4 rounded-lg shadow text-[15px] leading-relaxed text-gray-800 whitespace-pre-wrap mb-8"
          >
            {job.description?.trim() ? job.description : 'No description provided.'}
          </motion.div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
            <button
              onClick={toggleBookmark}
              className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-md hover:bg-yellow-200 flex items-center gap-2"
            >
              {bookmarked.includes(String(job.id)) ? <FaStar /> : <FaRegStar />}
              {bookmarked.includes(String(job.id)) ? 'Bookmarked' : 'Save Job'}
            </button>

            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-6 py-2 rounded-md shadow text-white transition-colors duration-200 ease-in-out ${
                job.applyUrl ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Apply Now
            </a>
          </div>

          {/* Job Summary appears below Apply on mobile */}
          <section className="md:hidden bg-yellow-50 border border-yellow-200 p-6 rounded-xl shadow space-y-4 mb-10">
            <h2 className="text-xl font-bold text-yellow-800 flex items-center gap-2"><FaBriefcase /> Job Summary</h2>
            <ul className="text-sm text-yellow-900 space-y-2">
              <li><FaBriefcase className="inline mr-2" /><strong>Position:</strong> {job.title}</li>
              <li><FaBuilding className="inline mr-2" /><strong>Company:</strong> {job.company}</li>
              <li><FaMapMarkerAlt className="inline mr-2" /><strong>Location:</strong> Anywhere</li>
              <li><FaTags className="inline mr-2" /><strong>Type:</strong> {job.type}</li>
              <li><FaMoneyBillWave className="inline mr-2" /><strong>Salary:</strong> {job.salaryType === 'hourly' ? `$${job.salary}/hr` : `$${job.salary}/yr`}</li>
              <li><FaCalendarAlt className="inline mr-2" /><strong>Posted:</strong> {new Date(job.datePosted).toLocaleDateString()}</li>
              <li><FaTags className="inline mr-2" /><strong>Category:</strong> {job.category}</li>
            </ul>
          </section>

          {/* SIMILAR JOBS */}
          {similarJobs.length > 0 && (
            <section className="mb-16">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Similar Jobs</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border border-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left p-3 border-b">Title</th>
                      <th className="text-left p-3 border-b">Company</th>
                      <th className="text-left p-3 border-b">Type</th>
                      <th className="text-left p-3 border-b">Posted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {similarJobs.map(sim => (
                      <tr key={sim.id} className="hover:bg-gray-50">
                        <td className="p-3">
                          <Link href={`/jobs/${sim.id}`} className="text-blue-600 hover:underline">
                            {sim.title}
                          </Link>
                        </td>
                        <td className="p-3">{sim.company}</td>
                        <td className="p-3">{sim.type}</td>
                        <td className="p-3">{new Date(sim.datePosted).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <EmailSubscription />
        </div>

        {/* Desktop Sidebar Summary */}
        <aside className="hidden md:block bg-yellow-50 border border-yellow-200 p-6 rounded-xl shadow space-y-4 sticky top-24 h-fit">
          <h2 className="text-xl font-bold text-yellow-800 flex items-center gap-2"><FaBriefcase /> Job Summary</h2>
          <ul className="text-sm text-yellow-900 space-y-2">
            <li><FaBriefcase className="inline mr-2" /><strong>Position:</strong> {job.title}</li>
            <li><FaBuilding className="inline mr-2" /><strong>Company:</strong> {job.company}</li>
            <li><FaMapMarkerAlt className="inline mr-2" /><strong>Location:</strong> Anywhere</li>
            <li><FaTags className="inline mr-2" /><strong>Type:</strong> {job.type}</li>
            <li><FaMoneyBillWave className="inline mr-2" /><strong>Salary:</strong> {job.salaryType === 'hourly' ? `$${job.salary}/hr` : `$${job.salary}/yr`}</li>
            <li><FaCalendarAlt className="inline mr-2" /><strong>Posted:</strong> {new Date(job.datePosted).toLocaleDateString()}</li>
            <li><FaTags className="inline mr-2" /><strong>Category:</strong> {job.category}</li>
          </ul>
        </aside>
      </div>
    </main>
  );
}

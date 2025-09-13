'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Job } from '@/types';
import { FaRegStar, FaStar } from 'react-icons/fa';
import { FaGlobe } from 'react-icons/fa6';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (move to a separate config file in production)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function BookmarksPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [bookmarked, setBookmarked] = useState<string[]>([]);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      alert('You must be logged in to view bookmarks.');
      router.push('/auth'); // Updated to /auth as per your new page
    }
  }, [user, router]);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        // Fetch jobs from Supabase (adjust table name if different)
        const { data, error } = await supabase
          .from('jobs')
          .select('*'); // Add filters if needed (e.g., public data or user-specific)

        if (error) throw error;

        setJobs(data || []);

        // Load bookmarked jobs from localStorage
        const saved = localStorage.getItem('bookmarkedJobs');
        if (saved) {
          setBookmarked(JSON.parse(saved));
        }
      } catch (err) {
        console.error('Error fetching bookmarks:', err);
      }
    };

    fetchBookmarks();
  }, []);

  const bookmarkedJobs = jobs.filter((job) =>
    bookmarked.includes(String(job.id))
  );

  return (
    <main className="max-w-6xl mx-auto p-6 min-h-[80vh]">
      <h1 className="text-3xl font-bold mb-6">Your Bookmarked Jobs</h1>

      {bookmarkedJobs.length > 0 ? (
        <div className="space-y-4">
          {bookmarkedJobs.map((job) => (
            <div
              key={job.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border border-gray-200 rounded-xl bg-white hover:shadow-md transition"
            >
              <div className="flex-shrink-0 mr-4">
                <img
                  src={job.logo?.trim() ? job.logo : '/default-logo.png'}
                  alt={`${job.company} logo`}
                  className="w-16 h-16 object-contain rounded-md border"
                />
              </div>

              <div className="flex-1">
                <Link href={`/jobs/${job.id}`} className="block">
                  <h3 className="text-lg font-bold text-blue-600 hover:underline flex items-center gap-2">
                    {job.title} <FaGlobe className="text-blue-400" />
                  </h3>
                  <p className="text-gray-700 font-medium">{job.company}</p>
                </Link>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">Anywhere</span>
                  <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">{job.type}</span>
                  <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                    💰 {job.salaryType === 'hourly' ? `$${job.salary}/hr` : `$${job.salary}/yr`}
                  </span>
                </div>
              </div>

              <div className="text-yellow-500">
                <FaStar className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center">You have no bookmarked jobs yet.</p>
      )}
    </main>
  );
}
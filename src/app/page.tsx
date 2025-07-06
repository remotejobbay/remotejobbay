'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Listbox } from '@headlessui/react';
import {
  FaChevronDown,
  FaRegStar,
  FaStar,
  FaMapMarkerAlt,
  FaClock,
  FaDollarSign,
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Job } from '@/types';
import EmailSubscription from '@/components/EmailSubscription';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/utils/supabase/supabaseClient';

const categories = [
  '',
  'Frontend', 'Backend', 'Design', 'DevOps', 'Product',
  'Finance', 'Accounting', 'Marketing', 'Sales', 'Customer Support',
  'Project Management', 'Writing', 'Data Science', 'AI & Machine Learning',
  'Legal', 'Education', 'Human Resources',
];

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [bookmarked, setBookmarked] = useState<string[]>([]);
  const { user } = useUser();
  const jobsPerPage = 25;
  const [currentPage, setCurrentPage] = useState(1);
  const jobListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching jobs:', error.message);
      } else {
        const filtered = (data || []).filter((job) => job.applyUrl?.trim() !== '');
        setJobs(filtered);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('bookmarkedJobs');
    if (saved) {
      setBookmarked(JSON.parse(saved));
    }
  }, []);

  const toggleBookmark = (jobId: string | number) => {
    if (!user) {
      alert('Please log in to save jobs.');
      return;
    }

    const idStr = String(jobId);
    let updated = [...bookmarked];

    if (bookmarked.includes(idStr)) {
      updated = updated.filter((id) => id !== idStr);
    } else {
      updated.push(idStr);
    }

    setBookmarked(updated);
    localStorage.setItem('bookmarkedJobs', JSON.stringify(updated));
  };

  const getPostedLabel = (datePosted: string) => {
    const jobDate = new Date(datePosted);
    const today = new Date();
    const diffTime = today.getTime() - jobDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return '📅 Today';
    if (diffDays === 1) return '📅 1 day ago';
    return `📅 ${diffDays} days ago`;
  };

  const filteredJobs = jobs
    .filter((job) => {
      const matchesSearch = (job.title + job.company + job.location)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory
        ? job.category === selectedCategory
        : true;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) =>
      new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime()
    );

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * jobsPerPage,
    currentPage * jobsPerPage
  );

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="max-w-6xl mx-auto p-6 min-h-[80vh]"
    >
      {/* Hero Section */}
      <motion.div
        className="text-center mb-6 bg-gradient-to-r from-blue-100 to-teal-100 py-6 px-4 rounded-xl shadow-sm border border-blue-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-800">
          🌍💼 High-quality, fully remote jobs that you can do from any country 🖥️✨
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          No Borders. No Limitations. Work from Accra, Mexico City, Hanoi, Lisbon — anywhere.
        </p>
      </motion.div>

      {/* Email Subscription */}
      <section className="mb-8 max-w-xl mx-auto w-full">
        <div className="bg-white rounded-xl p-4 shadow-md border border-yellow-200">
          <EmailSubscription />
        </div>
      </section>

      {/* Search & Filter */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-md">
        <input
          type="text"
          placeholder="Search by title, company, or category..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
            setTimeout(() => jobListRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
          }}
          className="px-5 py-3 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm placeholder-gray-400 text-gray-700"
        />

        <Listbox
          value={selectedCategory}
          onChange={(value) => {
            setSelectedCategory(value);
            setCurrentPage(1);
            setTimeout(() => jobListRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
          }}
        >
          <div className="relative w-full sm:w-[250px]">
            <Listbox.Button className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-gray-700 shadow-sm text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-400">
              {selectedCategory || 'All Categories'}
              <FaChevronDown className="ml-2 text-gray-500" />
            </Listbox.Button>
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
              {categories.map((category) => (
                <Listbox.Option
                  key={category}
                  value={category}
                  className={({ active }) =>
                    `cursor-pointer select-none px-4 py-2 ${
                      active ? 'bg-blue-100 text-blue-800' : 'text-gray-800'
                    }`
                  }
                >
                  {category || 'All Categories'}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
      </div>

      {/* Job Cards */}
      <div ref={jobListRef} className="space-y-4">
        {paginatedJobs.length > 0 ? (
          paginatedJobs.map((job) => (
            <motion.div
              key={job.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-yellow-100 border border-yellow-300 hover:shadow-xl hover:-translate-y-1 hover:ring-2 hover:ring-yellow-400 transform transition-all duration-300"
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-center gap-4 w-full">
                {/* Conditional Logo Rendering */}
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
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 hover:underline">
                      {job.title}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">{job.company}</p>
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

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => toggleBookmark(job.id)}
                    className="text-yellow-500 hover:text-yellow-600"
                  >
                    {bookmarked.includes(String(job.id)) ? (
                      <FaStar className="w-4 h-4" />
                    ) : (
                      <FaRegStar className="w-4 h-4" />
                    )}
                  </button>
                  <span className="text-[10px] font-medium bg-blue-200 text-blue-900 px-2 py-1 rounded-full">
                    {getPostedLabel(job.datePosted)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No jobs found.</p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 bg-white text-gray-700 border rounded-md">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </motion.main>
  );
}

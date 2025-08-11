'use client';

import { useState, useEffect, useRef } from 'react';
import { Listbox } from '@headlessui/react';
import { FaChevronDown } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Job } from '@/types';
import EmailSubscription from '@/components/EmailSubscription';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/utils/supabase/supabaseClient';
import JobCard from '@/components/JobCard';

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
  const [inputTerm, setInputTerm] = useState('');
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

      if (error) console.error('Error fetching jobs:', error.message);
      else setJobs((data || []).filter(j => j.applyUrl?.trim() !== ''));
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('bookmarkedJobs');
    if (saved) setBookmarked(JSON.parse(saved));
  }, []);

  const toggleBookmark = (id: string | number) => {
    if (!user) return alert('Please log in to save jobs.');
    const idStr = String(id);
    const next = bookmarked.includes(idStr)
      ? bookmarked.filter(b => b !== idStr)
      : [...bookmarked, idStr];
    setBookmarked(next);
    localStorage.setItem('bookmarkedJobs', JSON.stringify(next));
  };

  const handleSearch = () => {
    setSearchTerm(inputTerm.trim());
    setCurrentPage(1);
    setTimeout(() => jobListRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const filteredJobs = jobs
    .filter(j => {
      // If no search term or category, return all jobs
      if (!searchTerm && !selectedCategory) return true;

      // Split search term into keywords and check if any keyword matches
      const keywords = searchTerm.toLowerCase().split(/\s+/).filter(k => k);
      const jobText = `${j.title} ${j.company} ${j.location} ${j.category}`.toLowerCase();
      const matchSearch = searchTerm ? keywords.some(keyword => jobText.includes(keyword)) : true;

      // Category match (exact match if selected)
      const matchCat = selectedCategory ? j.category === selectedCategory : true;

      return matchSearch && matchCat;
    })
    .sort((a, b) => new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime());

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * jobsPerPage,
    currentPage * jobsPerPage,
  );

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="max-w-7xl mx-auto p-6 min-h-[80vh] bg-gradient-to-br from-teal-50 via-purple-50 to-orange-50"
    >
      {/* Hero */}
      <motion.div
        className="text-center mb-8 bg-gradient-to-r from-teal-200 to-indigo-300 py-12 px-6 rounded-2xl shadow-lg border border-teal-200"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.7, ease: 'easeOut' }}
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-md">
          🌐💼 Discover Remote Jobs Worldwide! ✨
        </h1>
        <p className="text-lg sm:text-xl text-teal-50 mt-4 font-medium">
          Work from anywhere—Accra, Mexico City, Hanoi, Lisbon, or beyond!
        </p>
      </motion.div>

      {/* Email Subscription */}
      <section className="mb-8 max-w-2xl mx-auto w-full">
        <motion.div
          className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-xl border border-yellow-200/70"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <EmailSubscription />
        </motion.div>
      </section>

      {/* Search & Filter */}
      <motion.div
        className="mb-8 flex flex-col sm:flex-row gap-4 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-indigo-200/70"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <input
          type="text"
          placeholder="Search by title, company, category, or location (e.g., artificial, Google)..."
          value={inputTerm}
          onChange={e => setInputTerm(e.target.value)}
          className="px-6 py-4 border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-md placeholder-gray-500 text-gray-800 transition-all duration-200"
        />
        <button
          onClick={handleSearch}
          className="bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white px-6 py-4 rounded-xl shadow-lg w-full sm:w-auto transition-all duration-200"
        >
          Search
        </button>

        <Listbox
          value={selectedCategory}
          onChange={v => {
            setSelectedCategory(v);
            setCurrentPage(1);
            setTimeout(() => jobListRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
          }}
        >
          <div className="relative w-full sm:w-[250px]">
            <Listbox.Button className="w-full px-6 py-4 border border-gray-200 rounded-xl bg-white text-gray-800 shadow-md text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-200">
              {selectedCategory || 'All Categories'}
              <FaChevronDown className="ml-2 text-gray-600" />
            </Listbox.Button>
            <Listbox.Options className="absolute mt-2 max-h-60 w-full overflow-auto rounded-xl bg-white py-2 text-base shadow-lg ring-1 ring-gray-200 focus:outline-none z-50">
              {categories.map(cat => (
                <Listbox.Option
                  key={cat}
                  value={cat}
                  className={({ active }) =>
                    `cursor-pointer select-none px-6 py-3 ${
                      active ? 'bg-teal-50 text-teal-800' : 'text-gray-800'
                    } hover:bg-teal-100 transition-all duration-200`
                  }
                >
                  {cat || 'All Categories'}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
      </motion.div>

      {/* Job List */}
      <div ref={jobListRef} className="space-y-6">
        {paginatedJobs.length > 0 ? (
          paginatedJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              bookmarked={bookmarked}
              toggleBookmark={toggleBookmark}
              showBookmark
            />
          ))
        ) : (
          <p className="text-gray-600 text-center text-xl font-medium">No jobs found.</p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-3 mt-12">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className={`rounded-full p-2 px-5 text-sm font-medium transition-all duration-200 shadow-lg ${
              currentPage === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
            }`}
          >
            ‹ Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 shadow-lg ${
                currentPage === page
                  ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`rounded-full p-2 px-5 text-sm font-medium transition-all duration-200 shadow-lg ${
              currentPage === totalPages
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
            }`}
          >
            Next ›
          </button>
        </div>
      )}
    </motion.main>
  );
}
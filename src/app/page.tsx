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
    setSearchTerm(inputTerm);
    setCurrentPage(1);
    setTimeout(() => jobListRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const filteredJobs = jobs
    .filter(j => {
      const matchSearch = (j.title + j.company + j.location)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
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
      className="max-w-6xl mx-auto p-6 min-h-[80vh]"
    >
      {/* Hero */}
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
          No Borders. No Limitations. Work from Accra, Mexico City, Hanoi, Lisbon - anywhere.
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
          value={inputTerm}
          onChange={e => setInputTerm(e.target.value)}
          className="px-5 py-3 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm placeholder-gray-400 text-gray-700"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg shadow w-full sm:w-auto"
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
            <Listbox.Button className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-gray-700 shadow-sm text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-400">
              {selectedCategory || 'All Categories'}
              <FaChevronDown className="ml-2 text-gray-500" />
            </Listbox.Button>
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
              {categories.map(cat => (
                <Listbox.Option
                  key={cat}
                  value={cat}
                  className={({ active }) =>
                    `cursor-pointer select-none px-4 py-2 ${
                      active ? 'bg-blue-100 text-blue-800' : 'text-gray-800'
                    }`
                  }
                >
                  {cat || 'All Categories'}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
      </div>

      {/* Job List */}
      <div ref={jobListRef} className="space-y-4">
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
          <p className="text-gray-500 text-center">No jobs found.</p>
        )}
      </div>

      {/* Pagination - new colorful modern style */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-10">
          {/* Prev */}
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className={`rounded-full p-2 px-4 text-sm font-medium transition shadow ${
              currentPage === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            ‹ Prev
          </button>

          {/* Pages */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition shadow ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {page}
            </button>
          ))}

          {/* Next */}
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`rounded-full p-2 px-4 text-sm font-medium transition shadow ${
              currentPage === totalPages
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            Next ›
          </button>
        </div>
      )}
    </motion.main>
  );
}

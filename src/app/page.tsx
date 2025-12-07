'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCode, FaServer, FaPaintBrush, FaCogs, FaBox, FaChartLine, FaCalculator, FaBullhorn, FaPhone, FaHeadset, FaTasks, FaPen, FaDatabase, FaBrain, FaBalanceScale, FaChalkboard, FaUsers, FaLaptopCode, FaMobileAlt, FaShieldAlt, FaUserCog, FaBug } from 'react-icons/fa';
import { Job } from '@/types';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/utils/supabase/supabaseClient';
import JobCard from '@/components/JobCard';

const categories = [
  { name: 'All', icon: null },
  { name: 'Frontend', icon: FaCode },
  { name: 'Backend', icon: FaServer },
  { name: 'Fullstack', icon: FaLaptopCode },
  { name: 'Mobile Development', icon: FaMobileAlt },
  { name: 'Cybersecurity', icon: FaShieldAlt },
  { name: 'Engineering Management', icon: FaUserCog },
  { name: 'Design', icon: FaPaintBrush },
  { name: 'DevOps', icon: FaCogs },
  { name: 'Product', icon: FaBox },
  { name: 'Finance', icon: FaChartLine },
  { name: 'Accounting', icon: FaCalculator },
  { name: 'Marketing', icon: FaBullhorn },
  { name: 'Sales', icon: FaPhone },
  { name: 'Customer Support', icon: FaHeadset },
  { name: 'Project Management', icon: FaTasks },
  { name: 'Writing', icon: FaPen },
  { name: 'Data Science', icon: FaDatabase },
  { name: 'AI & Machine Learning', icon: FaBrain },
  { name: 'Legal', icon: FaBalanceScale },
  { name: 'Education', icon: FaChalkboard },
  { name: 'Human Resources', icon: FaUsers },
  { name: 'QA Engineer', icon: FaBug },
];

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [inputTerm, setInputTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [bookmarked, setBookmarked] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const jobsPerPage = 25;
  const [currentPage, setCurrentPage] = useState(1);
  const jobListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) console.error('Error fetching jobs:', error.message);
      else setJobs((data || []).filter(j => j.applyUrl?.trim() !== ''));
      setLoading(false);
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
      const keywords = searchTerm.toLowerCase().split(/\s+/).filter(k => k);
      const jobText = `${j.title} ${j.company} ${j.location} ${j.category}`.toLowerCase();
      const matchSearch = searchTerm ? keywords.some(keyword => jobText.includes(keyword)) : true;
      const matchCategory = selectedCategory === 'All' || j.category === selectedCategory;
      return matchSearch && matchCategory;
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
      className="max-w-7xl mx-auto p-2 sm:p-4 min-h-[80vh] bg-gradient-to-br from-teal-50 via-purple-50 to-orange-50"
    >
      {/* Integrated Hero Section with Email Subscription */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="px-4 pt-4 pb-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:pt-20 lg:pb-20"
      >
        <div className="grid gap-10 row-gap-8 lg:grid-cols-2">
          {/* Left Column: Text and Subscription */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            <div className="max-w-xl mb-6">
              <div>
                <p className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-teal-900 uppercase rounded-full bg-teal-200">
                  100% REMOTE
                </p>
              </div>
              <h2 className="max-w-lg mb-6 font-sans text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl sm:leading-none font-poppins">
                Discover Your Dream Remote Job<br className="hidden md:block" />
                <span className="inline-block text-teal-600">with RemoteJobBay</span>
              </h2>
              <p className="text-base text-gray-700 md:text-lg">
Your location doesn’t matter. Your skills do. Find remote opportunities open to all countries.
              </p>
            </div>
            {/* Email Subscription Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-lg border border-teal-200/70 max-w-md"
            >
              <h3 className="text-lg font-semibold text-teal-800 mb-4">
Get Exclusive Remote Job Alerts</h3>
              <form className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-md text-base text-gray-800"
                  required
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white px-6 py-2 rounded-xl shadow-md transition-colors duration-200"
                >
                  Subscribe
                </button>
              </form>
            </motion.div>
          </motion.div>

          {/* Right Column: Decorative SVGs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative flex items-center justify-center"
          >
            <svg
              className="absolute w-full text-teal-300"
              fill="currentColor"
              viewBox="0 0 600 392"
            >
              <rect x="0" y="211" width="75" height="181" rx="8"></rect>
              <rect x="525" y="260" width="75" height="132" rx="8"></rect>
              <rect x="105" y="83" width="75" height="309" rx="8"></rect>
              <rect x="210" y="155" width="75" height="237" rx="8"></rect>
              <rect x="420" y="129" width="75" height="263" rx="8"></rect>
              <rect x="315" y="0" width="75" height="392" rx="8"></rect>
            </svg>
            <svg
              className="relative w-full text-indigo-300"
              fill="currentColor"
              viewBox="0 0 600 392"
            >
              <rect x="0" y="311" width="75" height="81" rx="8"></rect>
              <rect x="525" y="351" width="75" height="41" rx="8"></rect>
              <rect x="105" y="176" width="75" height="216" rx="8"></rect>
              <rect x="210" y="237" width="75" height="155" rx="8"></rect>
              <rect x="420" y="205" width="75" height="187" rx="8"></rect>
              <rect x="315" y="83" width="75" height="309" rx="8"></rect>
            </svg>
          </motion.div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        className="mb-6 flex flex-col sm:flex-row gap-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-indigo-200/70"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by title, company, category, or location..."
            value={inputTerm}
            onChange={(e) => setInputTerm(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-md text-base leading-relaxed placeholder-gray-500 text-gray-800 transition-all duration-200"
            aria-label="Search jobs by title, company, category, or location"
          />
          {inputTerm && (
            <button
              onClick={() => {
                setInputTerm('');
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-base"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        <button
          onClick={handleSearch}
          className="bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white px-4 py-2 rounded-xl shadow-lg w-full sm:w-auto text-base leading-relaxed transition-all duration-200"
          aria-label="Submit job search"
        >
          Search
        </button>
      </motion.div>

      {/* Category Cardbox with Icons */}
      <motion.div
        className="mb-6 p-2 bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-indigo-100/50 overflow-x-auto"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="flex gap-2 py-2 px-2 flex-wrap justify-center" style={{ minHeight: '3rem' }}>
          {categories.map(({ name, icon: Icon }) => (
            <motion.button
              key={name}
              onClick={() => {
                setSelectedCategory(name);
                setCurrentPage(1);
                setTimeout(() => jobListRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
              }}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium flex items-center gap-1 transition-all duration-300 ${
                selectedCategory === name
                  ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
              }`}
              whileHover={{ scale: 1.05, rotate: 1 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Filter jobs by ${name} category`}
              role="button"
            >
              {Icon && <Icon className="text-base" aria-hidden="true" />}
              {name}
            </motion.button>
          ))}
        </div>
        <style jsx>{`
          .overflow-x-auto::-webkit-scrollbar {
            height: 0.5rem;
          }
          .overflow-x-auto::-webkit-scrollbar-thumb {
            background-color: #9ca3af;
            border-radius: 0.25rem;
          }
          .overflow-x-auto::-webkit-scrollbar-track {
            background-color: #f3f4f6;
          }
        `}</style>
      </motion.div>

      {/* Job List */}
      <div ref={jobListRef} className="space-y-4">
        <AnimatePresence>
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-600 text-lg font-medium"
            >
              <svg
                className="animate-spin h-6 w-6 mx-auto text-teal-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                />
              </svg>
              Loading jobs...
            </motion.div>
          ) : paginatedJobs.length > 0 ? (
            paginatedJobs.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <JobCard
                  job={job}
                  bookmarked={bookmarked}
                  toggleBookmark={toggleBookmark}
                  showBookmark
                />
              </motion.div>
            ))
          ) : (
            <motion.p
              className="text-gray-700 text-center text-lg font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              No jobs found for this category or search. Try selecting "All" or subscribing for new job alerts!
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className={`rounded-full p-1 px-3 text-sm font-medium transition-all duration-200 shadow-md ${
              currentPage === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
            }`}
            aria-label="Previous page"
          >
            ‹ Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`rounded-full px-2 py-1 text-sm font-medium transition-all duration-200 shadow-md ${
                currentPage === page
                  ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
              aria-label={`Go to page ${page}`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`rounded-full p-1 px-3 text-sm font-medium transition-all duration-200 shadow-md ${
              currentPage === totalPages
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
            }`}
            aria-label="Next page"
          >
            Next ›
          </button>
        </div>
      )}
    </motion.main>
  );
}
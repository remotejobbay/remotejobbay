'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCode, FaServer, FaPaintBrush, FaCogs, FaBox, FaChartLine, 
  FaCalculator, FaBullhorn, FaPhone, FaHeadset, FaTasks, FaPen, 
  FaDatabase, FaBrain, FaBalanceScale, FaChalkboard, FaUsers, 
  FaLaptopCode, FaMobileAlt, FaShieldAlt, FaUserCog, FaBug, 
  FaBitcoin, FaHeartbeat, FaGamepad, FaCloud, FaUserTie,
  FaChevronDown, FaSearch, FaGlobeAmericas
} from 'react-icons/fa';
import { Job } from '@/types';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/utils/supabase/supabaseClient';
import JobCard from '@/components/JobCard';

const categories = [
  { name: 'All', icon: FaGlobeAmericas },
  { name: 'Frontend', icon: FaCode },
  { name: 'Backend', icon: FaServer },
  { name: 'Fullstack', icon: FaLaptopCode },
  { name: 'Mobile Development', icon: FaMobileAlt },
  { name: 'Design', icon: FaPaintBrush },
  { name: 'DevOps', icon: FaCogs },
  { name: 'Cloud & SysAdmin', icon: FaCloud },
  { name: 'Cybersecurity', icon: FaShieldAlt },
  { name: 'Data Science', icon: FaDatabase },
  { name: 'AI & Machine Learning', icon: FaBrain },
  { name: 'Product', icon: FaBox },
  { name: 'Project Management', icon: FaTasks },
  { name: 'Marketing', icon: FaBullhorn },
  { name: 'Sales', icon: FaPhone },
  { name: 'Customer Support', icon: FaHeadset },
  { name: 'Finance', icon: FaChartLine },
  { name: 'Accounting', icon: FaCalculator },
  { name: 'Human Resources', icon: FaUsers },
  { name: 'Legal', icon: FaBalanceScale },
  { name: 'Writing', icon: FaPen },
  { name: 'Education', icon: FaChalkboard },
  { name: 'Healthcare', icon: FaHeartbeat },
  { name: 'Web3 & Crypto', icon: FaBitcoin },
  { name: 'Gaming', icon: FaGamepad },
  { name: 'Virtual Assistant', icon: FaUserTie },
  { name: 'QA Engineer', icon: FaBug },
  { name: 'Engineering Management', icon: FaUserCog },
];

const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];

export default function Home() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [inputTerm, setInputTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // New Filter States
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [minSalary, setMinSalary] = useState<number>(0);
  const [sortBy, setSortBy] = useState('newest');

  const [bookmarked, setBookmarked] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user } = useUser();
  const jobsPerPage = 25;
  const [currentPage, setCurrentPage] = useState(1);
  const jobListRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync Category with URL
  useEffect(() => {
    const categoryQuery = searchParams.get('category');
    if (categoryQuery) {
      setSelectedCategory(categoryQuery);
      setCurrentPage(1);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('post_to_site', true) 
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error:', error.message);
        setLoading(false);
        return;
      }

      const formattedJobs = (data || []).map((job) => ({
        ...job,
        id: String(job.id),
        title: job.title || 'Untitled Position',
        company: job.company || 'Unknown Company',
        location: job.location || 'Remote',
        applyUrl: job.apply_url || job.applyUrl || '#', 
        datePosted: job.created_at || job.datePosted || new Date().toISOString(),
        salary: String(job.salary_text || job.salary || 'Not Listed'), 
        // We'll extract a numeric value for the slider filter
        numericSalary: parseInt(String(job.salary_text || job.salary).replace(/[^0-9]/g, '')) || 0,
        category: job.category || 'Other',
        type: job.type || (job.title?.toLowerCase().includes('contract') ? 'Contract' : 'Full-time')
      }));

      setJobs(formattedJobs as any);
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
    jobListRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
    setCurrentPage(1);
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((j: any) => {
      const jobText = `${j.title} ${j.company} ${j.category}`.toLowerCase();
      const matchSearch = searchTerm ? jobText.includes(searchTerm.toLowerCase()) : true;
      const matchCategory = selectedCategory === 'All' || j.category === selectedCategory;
      const matchType = selectedTypes.length === 0 || selectedTypes.includes(j.type);
      
      // Assumes numericSalary was parsed. If minSalary is 0, it ignores the filter.
      const matchSalary = minSalary === 0 || (j.numericSalary && j.numericSalary >= minSalary * 1000);

      return matchSearch && matchCategory && matchType && matchSalary;
    }).sort((a: any, b: any) => {
      if (sortBy === 'newest') return new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime();
      if (sortBy === 'oldest') return new Date(a.datePosted).getTime() - new Date(b.datePosted).getTime();
      // Add more sorting if needed
      return 0;
    });
  }, [jobs, searchTerm, selectedCategory, selectedTypes, minSalary, sortBy]);

  const paginatedJobs = filteredJobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const CurrentCategoryIcon = categories.find(c => c.name === selectedCategory)?.icon || FaGlobeAmericas;

  return (
    <main className="min-h-screen bg-[#f3f4f6]">
      {/* HERO SECTION */}
      <div className="relative bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white py-20 text-center">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              Find Your Next Remote Adventure
            </h1>
            <p className="text-lg opacity-90 max-w-2xl mx-auto mb-10">
              The premium job board for remote professionals. We curate the best opportunities from top-tier companies worldwide.
            </p>
          </motion.div>

          {/* SEARCH BOX */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-3 p-4 bg-white rounded-lg shadow-xl border border-gray-200"
          >
            <div className="relative flex-1 w-full">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Job title, keywords, or company..."
                value={inputTerm}
                onChange={(e) => setInputTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-11 pr-4 py-3 bg-transparent focus:outline-none text-gray-800 text-base"
              />
            </div>
            <button
              onClick={handleSearch}
              className="w-full md:w-auto px-10 py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-md font-semibold transition-all shadow-md active:scale-95"
            >
              Search
            </button>
          </motion.div>
        </div>
      </div>

      {/* TWO-COLUMN JOB LISTINGS SECTION */}
      <div className="max-w-7xl mx-auto px-4 py-12" ref={jobListRef}>
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-8">
          
          {/* LEFT SIDEBAR: FILTERS PANEL */}
          <aside className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 lg:sticky lg:top-[85px] h-fit">
            <h3 className="text-lg font-bold text-gray-800 mb-5">Filters</h3>
            
            {/* Custom Category Dropdown (Replaced Native Select) */}
            <div className="mb-6 border-b border-gray-100 pb-5">
              <h4 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Category</h4>
              
              <div 
                className="relative w-full"
                ref={dropdownRef}
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <div className="w-full p-2.5 border border-gray-200 rounded text-gray-700 bg-gray-50 cursor-pointer flex justify-between items-center hover:border-[#2563eb] transition-colors">
                  <span className="truncate pr-2">{selectedCategory}</span>
                  <FaChevronDown className={`text-gray-400 text-xs transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-xl max-h-64 overflow-y-auto"
                    >
                      {categories.map((cat) => (
                        <div
                          key={cat.name}
                          className={`px-3 py-2.5 cursor-pointer text-sm transition-colors group flex items-center gap-3 ${
                            selectedCategory === cat.name 
                              ? 'bg-blue-50 text-[#2563eb] font-semibold' 
                              : 'text-gray-700 hover:bg-[#2563eb] hover:text-white'
                          }`}
                          onClick={() => {
                            setSelectedCategory(cat.name);
                            setCurrentPage(1);
                            setIsDropdownOpen(false);
                          }}
                        >
                          <cat.icon className={`text-base ${
                            selectedCategory === cat.name 
                              ? "text-[#2563eb]" 
                              : "text-gray-400 group-hover:text-white"
                          }`} />
                          <span className="truncate">{cat.name}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Job Type Filter */}
            <div className="mb-6 border-b border-gray-100 pb-5">
              <h4 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Job Type</h4>
              <div className="flex flex-col gap-2">
                {jobTypes.map(type => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer text-gray-700 hover:text-[#2563eb] transition-colors">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-[#2563eb] focus:ring-[#2563eb]"
                      checked={selectedTypes.includes(type)}
                      onChange={() => handleTypeToggle(type)}
                    />
                    <span className="text-sm">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Salary Range Filter */}
            <div className="mb-2">
              <h4 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Min Salary (USD)</h4>
              <input 
                type="range" 
                min="0" 
                max="200" 
                step="10" 
                value={minSalary}
                onChange={(e) => { setMinSalary(Number(e.target.value)); setCurrentPage(1); }}
                className="w-full accent-[#2563eb]"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
                <span>$0</span>
                <span className="text-[#2563eb] font-bold">
                  {minSalary > 0 ? `$${minSalary}k+` : 'Any'}
                </span>
                <span>$200k+</span>
              </div>
            </div>
          </aside>

          {/* RIGHT COLUMN: JOB LIST */}
          <div className="flex flex-col gap-5">
            {/* Jobs Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">
                {selectedCategory === 'All' ? 'Latest Opportunities' : `${selectedCategory} Roles`}
                <span className="ml-2 text-sm font-normal text-gray-500">({filteredJobs.length} jobs)</span>
              </h2>
              
              <div className="flex items-center gap-2 mt-3 sm:mt-0">
                <span className="text-sm text-gray-500">Sort by:</span>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="p-1.5 text-sm border border-gray-200 rounded text-gray-700 bg-gray-50 focus:outline-none focus:border-[#2563eb]"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Job Cards */}
            <AnimatePresence mode="popLayout">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-28 w-full bg-white border border-gray-200 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : paginatedJobs.length > 0 ? (
                paginatedJobs.map((job) => (
                  <motion.div
                    key={job.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
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
                <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300 shadow-sm">
                  <p className="text-gray-500 font-medium text-lg mb-2">No jobs match your filters</p>
                  <button 
                    onClick={() => { setSelectedTypes([]); setMinSalary(0); setSelectedCategory('All'); }}
                    className="text-[#2563eb] hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </AnimatePresence>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  disabled={currentPage === 1}
                  onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({ top: 350, behavior: 'smooth' }); }}
                  className="w-10 h-10 flex items-center justify-center rounded border border-gray-200 bg-white disabled:opacity-30 text-gray-600 hover:bg-[#2563eb] hover:text-white transition-all shadow-sm"
                >
                  &larr;
                </button>
                <span className="text-sm font-bold text-gray-500 px-4">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({ top: 350, behavior: 'smooth' }); }}
                  className="w-10 h-10 flex items-center justify-center rounded border border-gray-200 bg-white disabled:opacity-30 text-gray-600 hover:bg-[#2563eb] hover:text-white transition-all shadow-sm"
                >
                  &rarr;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
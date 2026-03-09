'use client';

import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCode, FaServer, FaPaintBrush, FaCogs, FaBox, FaChartLine, 
  FaCalculator, FaBullhorn, FaPhone, FaHeadset, FaTasks, FaPen, 
  FaDatabase, FaBrain, FaBalanceScale, FaChalkboard, FaUsers, 
  FaLaptopCode, FaMobileAlt, FaShieldAlt, FaUserCog, FaBug, 
  FaBitcoin, FaHeartbeat, FaGamepad, FaCloud, FaUserTie,
  FaChevronDown, FaSearch, FaGlobeAmericas, FaEnvelope
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

// Data for featured popular categories (counts removed)
const popularCategories = [
  { name: 'Fullstack', icon: FaLaptopCode },
  { name: 'Design', icon: FaPaintBrush },
  { name: 'Marketing', icon: FaBullhorn },
  { name: 'Data Science', icon: FaDatabase }
];

type JobListItem = Job & {
  numericSalary: number;
};

function JobBoardContent() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [inputTerm, setInputTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
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

  // Email subscription state
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState('');

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
        salary: String(job.salary || job.salary_text || 'Not Listed'), 
        numericSalary: parseInt(String(job.salary || job.salary_text).replace(/[^0-9]/g, '')) || 0,
        category: job.category || 'Other',
        type: job.type || (job.title?.toLowerCase().includes('contract') ? 'Contract' : 'Full-time')
      }));

      setJobs(formattedJobs as JobListItem[]);
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

  const handleFeaturedCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setCurrentPage(1);
    jobListRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const jobText = `${j.title} ${j.company} ${j.category}`.toLowerCase();
      const matchSearch = searchTerm ? jobText.includes(searchTerm.toLowerCase()) : true;
      const matchCategory = selectedCategory === 'All' || j.category === selectedCategory;
      const matchType = selectedTypes.length === 0 || selectedTypes.includes(j.type);
      const matchSalary = minSalary === 0 || (j.numericSalary && j.numericSalary >= minSalary * 1000);

      return matchSearch && matchCategory && matchType && matchSalary;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime();
      if (sortBy === 'oldest') return new Date(a.datePosted).getTime() - new Date(b.datePosted).getTime();
      return 0;
    });
  }, [jobs, searchTerm, selectedCategory, selectedTypes, minSalary, sortBy]);

  const paginatedJobs = filteredJobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
    setSubscribeMessage('');

    try {
      const { error } = await supabase.from('emails').insert([{ email }]);
      if (error) throw error;
      setSubscribeMessage('Subscribed successfully!');
      setEmail('');
    } catch (error) {
      setSubscribeMessage('Error subscribing. Please try again.');
      // Unpack the Supabase error object so it's readable in the console
      console.error('Subscription error:', JSON.stringify(error, null, 2));
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f3f4f6]">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white py-20 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              Find Your Next Remote Adventure
            </h1>
            <p className="text-lg opacity-90 max-w-2xl mx-auto mb-10">
              The premium job board for remote professionals. We curate the best opportunities from top-tier companies worldwide.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-3 p-4 bg-white rounded-lg shadow-xl border border-gray-200 relative z-0"
          >
            <div className="relative flex-1 w-full">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Job title, keywords, or company..."
                value={inputTerm}
                onChange={(e) => setInputTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                suppressHydrationWarning
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

          {/* Email Subscription */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 max-w-md mx-auto"
          >
            <form onSubmit={handleSubscribe} className="flex items-center gap-2 bg-white p-2 rounded-md shadow-md border border-gray-200">
              <FaEnvelope className="text-gray-400 ml-2" />
              <input
                type="email"
                placeholder="Subscribe for job alerts"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-2 py-1 text-sm text-gray-800 focus:outline-none"
                required
              />
              <button
                type="submit"
                disabled={subscribing}
                className="px-4 py-1.5 bg-[#2563eb] text-white text-sm font-medium rounded-md hover:bg-[#1d4ed8] transition-colors disabled:opacity-50"
              >
                {subscribing ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
            {subscribeMessage && (
              <p className={`mt-2 text-sm ${subscribeMessage.includes('Error') ? 'text-red-200' : 'text-green-200'}`}>
                {subscribeMessage}
              </p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Job Listings Section */}
      <div className="max-w-7xl mx-auto px-4 py-12" ref={jobListRef}>
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-8">
          
          {/* Sidebar Filters */}
          <aside className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 lg:sticky lg:top-[85px] h-fit">
            <h3 className="text-lg font-bold text-gray-800 mb-5">Filters</h3>
            
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

          {/* Job Results */}
          <div className="flex flex-col gap-5">
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
                  suppressHydrationWarning
                  className="p-1.5 text-sm border border-gray-200 rounded text-gray-700 bg-gray-50 focus:outline-none focus:border-[#2563eb]"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>

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

      {/* Featured Job Categories Section */}
      <section className="bg-white py-16 border-b border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-12">Popular Job Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularCategories.map((cat, index) => (
              <div 
                key={index} 
                className="bg-white border border-gray-100 rounded-xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="w-16 h-16 rounded-full bg-blue-50 text-[#2563eb] flex items-center justify-center text-3xl mb-4">
                  <cat.icon />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-6">{cat.name}</h3>
                <button 
                  onClick={() => handleFeaturedCategoryClick(cat.name)}
                  className="mt-auto px-5 py-2 border-2 border-[#2563eb] text-[#2563eb] rounded-md hover:bg-[#2563eb] hover:text-white transition-colors text-sm font-semibold w-full"
                >
                  View Jobs
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Employer CTA Section */}
      <section className="py-20 bg-[#f3f4f6]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-[#1e3a8a] rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            <div className="p-10 md:p-16 flex-1 flex flex-col justify-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">For Employers</h2>
              <p className="text-blue-100 text-lg mb-8 max-w-lg leading-relaxed">
                Looking to hire quality candidates? Post a job on JobConnect and reach thousands of top-tier professionals seeking their next great opportunity.
              </p>
              <div>
                <Link href="/post" className="inline-block px-8 py-4 bg-white text-[#1e3a8a] rounded-md font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg active:scale-95">
                  Post a Job Today
                </Link>
              </div>
            </div>
            <div className="hidden md:block md:w-2/5 relative">
              <img 
                src="/api/placeholder/400/300" 
                alt="Hiring Manager" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1e3a8a] to-transparent"></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center">Loading job board...</div>}>
      <JobBoardContent />
    </Suspense>
  );
}
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
      console.error('Subscription error:', JSON.stringify(error, null, 2));
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-amber-50">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_60%)]"></div>
        <div className="absolute -top-28 -right-24 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-slate-200/60 blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div>
              <p className="text-xs font-semibold tracking-[0.3em] text-amber-700 uppercase mb-4">
                Remote jobs, verified
              </p>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight"
              >
                Find remote roles that respect your location and time zone
              </motion.h1>
              <p className="mt-5 text-lg text-slate-600 max-w-2xl">
                RemoteJobBay curates fully remote roles across engineering, design, product, marketing,
                support and many more. Apply faster with clear eligibility and direct employer links.
              </p>

              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8 flex flex-col md:flex-row items-center gap-3 p-4 bg-white rounded-2xl shadow-xl border border-slate-200"
              >
                <div className="relative flex-1 w-full">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Job title, keywords, or company"
                    value={inputTerm}
                    onChange={(e) => setInputTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    suppressHydrationWarning
                    className="w-full pl-11 pr-4 py-3 bg-transparent focus:outline-none text-slate-800 text-base"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="w-full md:w-auto px-8 py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-semibold transition-all shadow-md active:scale-95"
                >
                  Search jobs
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-6 max-w-md"
              >
                <form onSubmit={handleSubscribe} className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-md border border-slate-200">
                  <FaEnvelope className="text-slate-400 ml-2" />
                  <input
                    type="email"
                    placeholder="Get remote job alerts"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm text-slate-800 focus:outline-none"
                    required
                  />
                  <button
                    type="submit"
                    disabled={subscribing}
                    className="px-4 py-1.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    {subscribing ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </form>
                {subscribeMessage && (
                  <p className={`mt-2 text-sm ${subscribeMessage.includes('Error') ? 'text-red-500' : 'text-emerald-600'}`}>
                    {subscribeMessage}
                  </p>
                )}
              </motion.div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-8">
              <p className="text-xs font-semibold tracking-[0.2em] text-amber-700 uppercase">Why RemoteJobBay</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">Curated remote roles without the noise</h2>
              <div className="mt-6 grid gap-4 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">1</div>
                  <div>
                    <p className="font-semibold text-slate-900">Clear eligibility</p>
                    <p>We prioritize listings that specify location and time zone requirements.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">2</div>
                  <div>
                    <p className="font-semibold text-slate-900">Verified sources</p>
                    <p>Direct links to employers so you can apply confidently.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">3</div>
                  <div>
                    <p className="font-semibold text-slate-900">Global friendly</p>
                    <p>Roles that welcome applicants across regions whenever possible.</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <Link
                  href="/remote-jobs"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-amber-700 text-amber-800 font-semibold hover:bg-amber-50 transition-colors"
                >
                  SEO landing page
                </Link>
                <Link
                  href="/community"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
                >
                  Community hub
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12" ref={jobListRef}>
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          <aside className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 lg:sticky lg:top-[85px] h-fit">
            <h3 className="text-lg font-bold text-slate-800 mb-5">Filters</h3>

            <div className="mb-6 border-b border-slate-100 pb-5">
              <h4 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Category</h4>
              <div
                className="relative w-full"
                ref={dropdownRef}
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <div className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-700 bg-slate-50 cursor-pointer flex justify-between items-center hover:border-amber-500 transition-colors">
                  <span className="truncate pr-2">{selectedCategory}</span>
                  <FaChevronDown className={`text-slate-400 text-xs transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto"
                    >
                      {categories.map((cat) => (
                        <div
                          key={cat.name}
                          className={`px-3 py-2.5 cursor-pointer text-sm transition-colors group flex items-center gap-3 ${
                            selectedCategory === cat.name
                              ? 'bg-amber-50 text-amber-800 font-semibold'
                              : 'text-slate-700 hover:bg-amber-700 hover:text-white'
                          }`}
                          onClick={() => {
                            setSelectedCategory(cat.name);
                            setCurrentPage(1);
                            setIsDropdownOpen(false);
                          }}
                        >
                          <cat.icon className={`text-base ${
                            selectedCategory === cat.name
                              ? 'text-amber-700'
                              : 'text-slate-400 group-hover:text-white'
                          }`} />
                          <span className="truncate">{cat.name}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="mb-6 border-b border-slate-100 pb-5">
              <h4 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Job Type</h4>
              <div className="flex flex-col gap-2">
                {jobTypes.map(type => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-amber-700 transition-colors">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-amber-700 focus:ring-amber-600"
                      checked={selectedTypes.includes(type)}
                      onChange={() => handleTypeToggle(type)}
                    />
                    <span className="text-sm">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-2">
              <h4 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Min Salary (USD)</h4>
              <input
                type="range"
                min="0"
                max="200"
                step="10"
                value={minSalary}
                onChange={(e) => { setMinSalary(Number(e.target.value)); setCurrentPage(1); }}
                className="w-full accent-amber-600"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
                <span>$0</span>
                <span className="text-amber-700 font-bold">
                  {minSalary > 0 ? `$${minSalary}k+` : 'Any'}
                </span>
                <span>$200k+</span>
              </div>
            </div>
          </aside>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">
                {selectedCategory === 'All' ? 'Latest Opportunities' : `${selectedCategory} Roles`}
                <span className="ml-2 text-sm font-normal text-slate-500">({filteredJobs.length} jobs)</span>
              </h2>

              <div className="flex items-center gap-2 mt-3 sm:mt-0">
                <span className="text-sm text-slate-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  suppressHydrationWarning
                  className="p-1.5 text-sm border border-slate-200 rounded text-slate-700 bg-slate-50 focus:outline-none focus:border-amber-600"
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
                    <div key={i} className="h-28 w-full bg-white border border-slate-200 rounded-lg animate-pulse" />
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
                <div className="text-center py-20 bg-white rounded-lg border border-dashed border-slate-300 shadow-sm">
                  <p className="text-slate-500 font-medium text-lg mb-2">No jobs match your filters</p>
                  <button
                    onClick={() => { setSelectedTypes([]); setMinSalary(0); setSelectedCategory('All'); }}
                    className="text-amber-700 hover:underline"
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
                  className="w-10 h-10 flex items-center justify-center rounded border border-slate-200 bg-white disabled:opacity-30 text-slate-600 hover:bg-amber-700 hover:text-white transition-all shadow-sm"
                >
                  &larr;
                </button>
                <span className="text-sm font-bold text-slate-500 px-4">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({ top: 350, behavior: 'smooth' }); }}
                  className="w-10 h-10 flex items-center justify-center rounded border border-slate-200 bg-white disabled:opacity-30 text-slate-600 hover:bg-amber-700 hover:text-white transition-all shadow-sm"
                >
                  &rarr;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="bg-white py-16 border-b border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-800 mb-12">Popular Job Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularCategories.map((cat, index) => (
              <div
                key={index}
                className="bg-white border border-slate-100 rounded-2xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center text-3xl mb-4">
                  <cat.icon />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-6">{cat.name}</h3>
                <button
                  onClick={() => handleFeaturedCategoryClick(cat.name)}
                  className="mt-auto px-5 py-2 border-2 border-amber-700 text-amber-800 rounded-md hover:bg-amber-700 hover:text-white transition-colors text-sm font-semibold w-full"
                >
                  View Jobs
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-slate-700">
            <div className="p-10 md:p-16 flex-1 flex flex-col justify-center">
              <p className="text-xs uppercase tracking-[0.3em] text-amber-300 font-semibold">For employers</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Hire remote talent with clarity</h2>
              <p className="text-slate-300 text-lg mb-8 max-w-lg leading-relaxed">
                Post a job on RemoteJobBay and reach professionals who are actively seeking remote-first roles.
              </p>
              <div>
                <Link href="/post" className="inline-block px-8 py-4 bg-white text-slate-900 rounded-md font-bold text-lg hover:bg-slate-100 transition-colors shadow-lg active:scale-95">
                  Post a Job Today
                </Link>
              </div>
            </div>
            <div className="hidden md:block md:w-2/5 relative bg-gradient-to-br from-amber-200/30 via-slate-900 to-slate-900">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.3),_transparent_55%)]"></div>
              <div className="relative h-full w-full flex items-center justify-center">
                <div className="bg-white/10 border border-white/20 rounded-2xl p-8 text-white text-sm max-w-[240px]">
                  <p className="font-semibold">Hiring signal</p>
                  <p className="mt-2 text-slate-200">Showcase remote-friendly roles with clear eligibility and time zone notes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading job board...</div>}>
      <JobBoardContent />
    </Suspense>
  );
}

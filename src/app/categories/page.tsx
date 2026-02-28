'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion'; // Added for smooth animations
import { 
  FaCode, FaServer, FaPaintBrush, FaCogs, FaBox, FaChartLine, 
  FaCalculator, FaBullhorn, FaPhone, FaHeadset, FaTasks, FaPen, 
  FaDatabase, FaBrain, FaBalanceScale, FaChalkboard, FaUsers, 
  FaLaptopCode, FaMobileAlt, FaShieldAlt, FaUserCog, FaBug, FaBriefcase 
} from 'react-icons/fa';
import { Job } from '@/types';
import { supabase } from '@/utils/supabase/supabaseClient';
import JobCard from '@/components/JobCard'; // ✅ REUSING YOUR COMPONENT

// Define categories outside the component to prevent re-creation on every render
const CATEGORIES = [
  { name: 'All', icon: FaBriefcase },
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

export default function CategoriesPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  // Bookmark logic (optional, but good for consistency)
  const [bookmarked, setBookmarked] = useState<string[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      // Fetching strictly from 'jobs' table
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('datePosted', { ascending: false }); // Consistent ordering

      if (error) {
        console.error('Error fetching jobs:', error.message);
      } else {
        // Filter out jobs without apply links if necessary
        const validJobs = (data || []).map(job => ({
            ...job,
            id: String(job.id), // Ensure ID is string for JobCard
            // Ensure fallbacks for optional fields
            title: job.title || 'Untitled',
            company: job.company || 'Unknown',
            location: job.location || 'Remote',
            datePosted: job.datePosted || new Date().toISOString()
        }));
        setJobs(validJobs as Job[]);
      }
      setLoading(false);
    };

    fetchJobs();

    // Load bookmarks
    const saved = localStorage.getItem('bookmarkedJobs');
    if (saved) setBookmarked(JSON.parse(saved));
  }, []);

  const toggleBookmark = (id: string | number) => {
    const idStr = String(id);
    const next = bookmarked.includes(idStr)
      ? bookmarked.filter(b => b !== idStr)
      : [...bookmarked, idStr];
    setBookmarked(next);
    localStorage.setItem('bookmarkedJobs', JSON.stringify(next));
  };

  // Optimize filtering with useMemo
  const filteredJobs = useMemo(() => {
    return jobs.filter(j => 
      selectedCategory === 'All' || j.category === selectedCategory
    );
  }, [jobs, selectedCategory]);

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto p-4 sm:p-6 min-h-screen bg-gray-50"
    >
      <div className="text-center mb-10 mt-4">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
           Browse by <span className="text-teal-600">Category</span>
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Filter through our comprehensive list of remote opportunities to find the perfect fit for your skills.
        </p>
      </div>

      {/* Categories Filter Area */}
      <div className="mb-10 p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-3 justify-center">
          {CATEGORIES.map(({ name, icon: Icon }) => (
            <button
              key={name}
              onClick={() => setSelectedCategory(name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 transform hover:scale-105 ${
                selectedCategory === name
                  ? 'bg-teal-600 text-white shadow-md ring-2 ring-teal-600 ring-offset-2'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {Icon && <Icon className={selectedCategory === name ? "text-white" : "text-teal-500"} />}
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex flex-col items-center py-20">
            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-500 font-medium">Loading jobs...</p>
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid gap-4">
          {filteredJobs.map((job) => (
            // ✅ USING THE SHARED JOB CARD COMPONENT
            <JobCard 
                key={job.id} 
                job={job} 
                bookmarked={bookmarked}
                toggleBookmark={toggleBookmark}
                showBookmark={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <FaBriefcase className="mx-auto text-5xl text-gray-200 mb-4" />
            <h3 className="text-xl font-bold text-gray-800">No jobs found in {selectedCategory}</h3>
            <p className="text-gray-500 mt-2">Try selecting "All" or a different category.</p>
        </div>
      )}
    </motion.main>
  );
}
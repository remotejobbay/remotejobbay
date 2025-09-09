'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaCode, FaServer, FaPaintBrush, FaCogs, FaBox, FaChartLine, FaCalculator, FaBullhorn, FaPhone, FaHeadset, FaTasks, FaPen, FaDatabase, FaBrain, FaBalanceScale, FaChalkboard, FaUsers, FaLaptopCode, FaMobileAlt, FaShieldAlt, FaUserCog } from 'react-icons/fa';
import { Job } from '@/types';
import { supabase } from '@/utils/supabase/supabaseClient';

export default function CategoriesPage() {
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
  ];

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

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

  const filteredJobs = jobs.filter(j => 
    selectedCategory === 'All' || j.category === selectedCategory
  );

  return (
    <main className="max-w-7xl mx-auto p-6 min-h-screen bg-gradient-to-br from-teal-50 via-purple-50 to-orange-50">
      <h1 className="text-4xl font-extrabold mb-6 text-gray-800 drop-shadow-md text-center">
        🌐 Explore Job Categories
      </h1>
      <div className="mb-8 p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-teal-200/70">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-teal-400 scrollbar-track-gray-100">
          {categories.map(({ name, icon: Icon }) => (
            <button
              key={name}
              onClick={() => setSelectedCategory(name)}
              className={`flex items-center justify-center gap-2 p-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                selectedCategory === name
                  ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
              }`}
              aria-label={`View ${name} jobs`}
            >
              {Icon && <Icon className="text-lg" />}
              {name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-600 text-lg font-medium">
          <svg className="animate-spin h-8 w-8 mx-auto text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
          </svg>
          Loading jobs...
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <div key={job.id} className="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-1">
              <h3 className="text-xl font-semibold text-gray-800">{job.title}</h3>
              <p className="text-gray-600 mt-1">{job.company} - {job.location}</p>
              <p className="text-sm text-gray-500 mt-1">{new Date(job.datePosted).toLocaleDateString()}</p>
              <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block bg-teal-500 text-white px-3 py-1 rounded-full hover:bg-teal-600 transition">
                Apply Now
              </a>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-center text-lg font-medium">
          No jobs found for {selectedCategory}. Try another category!
        </p>
      )}
    </main>
  );
}
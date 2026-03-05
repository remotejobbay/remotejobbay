'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/utils/supabase/supabaseClient';
import { useRouter } from 'next/navigation';
import MobileMenu from '@/components/MobileMenu';
import { FaPaperPlane, FaChevronDown, FaGlobeAmericas, FaCode, FaServer, FaLaptopCode, FaMobileAlt, FaPaintBrush, FaCogs, FaCloud, FaShieldAlt, FaDatabase, FaBrain, FaBox, FaTasks, FaBullhorn, FaPhone, FaHeadset, FaChartLine, FaCalculator, FaUsers, FaBalanceScale, FaPen, FaChalkboard, FaHeartbeat, FaBitcoin, FaGamepad, FaUserTie, FaBug, FaUserCog } from 'react-icons/fa';

// Categories List matching your Home page
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

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default function Header() {
  const { user } = useUser();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePostJobClick = () => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'post_job_click', {
        event_category: 'engagement',
        event_label: 'Post a Job',
      });
    }
    if (user) {
      router.push('/post');
    } else {
      router.push('/auth');
    }
  };

  return (
    <header className="bg-gradient-to-br from-mint-200/90 via-mint-300/90 to-mint-200/90 backdrop-blur-md text-gray-800 shadow-md sticky top-0 z-50 border-b border-mint-400/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        
        {/* Logo Section */}
        <div className="flex items-center space-x-2 sm:space-x-8">
          <div className="flex items-center space-x-2">
            <span className="text-xl sm:text-2xl animate-pulse">🌍</span>
            <Link
              href="/"
              className="text-lg sm:text-xl font-bold text-amber-800 hover:text-amber-700 font-poppins transition-colors duration-300 whitespace-nowrap"
            >
              RemoteJobBay
            </Link>
          </div>

          {/* Categories Dropdown - Desktop & Mobile Friendly */}
          <div 
            className="relative" 
            ref={dropdownRef}
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)} // Kept for mobile touch compatibility
              className="inline-flex items-center justify-center text-amber-900 bg-white/50 border border-amber-200/50 hover:bg-white focus:ring-4 focus:ring-amber-200 font-medium rounded-lg text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2.5 transition-all outline-none"
              type="button"
            >
              Browse Roles
              <FaChevronDown className={`ms-2 text-[10px] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute left-0 mt-2 z-50 w-56 sm:w-64 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-2 border-b border-gray-100 bg-gray-50/50">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 px-2">Job Categories</p>
                </div>
                <ul className="max-h-[350px] overflow-y-auto p-1 custom-scrollbar scroll-smooth">
                  {categories.map((category) => (
                    <li key={category.name}>
                      <Link
                        href={`/?category=${category.name}`}
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 w-full p-2.5 text-sm text-gray-700 hover:bg-mint-100 hover:text-amber-800 rounded-lg transition-colors group"
                      >
                        <category.icon className="text-gray-400 group-hover:text-amber-600 transition-colors" />
                        <span className="font-medium">{category.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <span className="text-xs font-semibold text-amber-900/70 tracking-wide">
                Hi, {(user.email ?? 'user').split('@')[0]}
              </span>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.reload();
                }}
                className="text-xs bg-red-500/80 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-lg shadow-sm transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              className="text-xs font-bold text-amber-900 hover:text-amber-700 transition-colors"
            >
              Login
            </Link>
          )}

          <button
            onClick={handlePostJobClick}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <FaPaperPlane className="text-[10px]" />
            Post a Job
          </button>
        </nav>

        {/* Mobile Hamburger Button */}
        {/* FIX APPLIED HERE: Added 'relative z-[9999]' to ensure stacking context is respected */}
        <div className="md:hidden flex items-center gap-2 relative z-[9999]">
           <MobileMenu />
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </header>
  );
}

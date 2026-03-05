'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { 
  FaHome, 
  FaSignInAlt, 
  FaSignOutAlt, 
  FaBriefcase 
} from 'react-icons/fa';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  
  const containerRef = useRef<HTMLDivElement>(null);

  // CLICK OUTSIDE TO CLOSE MENU
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const handlePostJobClick = () => {
    setIsOpen(false);
    router.push(user ? '/post' : '/auth');
  };

  const handleLogout = async () => {
    // Using your existing logout logic
    await fetch('/api/logout', { method: 'POST' });
    location.reload();
  };

  return (
    <div className="sm:hidden relative" ref={containerRef}>
      
      {/* CUSTOM ANIMATED HAMBURGER BUTTON */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`hamburger hamburger--parallel p-2 -mr-2 focus:outline-none flex items-center justify-center ${isOpen ? 'is-active' : ''}`}
        type="button"
        aria-label="Toggle Menu"
      >
        <div className="inner relative w-6 h-6 flex flex-col justify-between">
          <span 
            className={`bar h-[3px] w-full bg-blue-800 rounded transition-all duration-500 ease-in-out transform origin-center ${
              isOpen ? 'rotate-45 translate-y-[10px]' : ''
            }`}
          ></span>
          <span 
            className={`bar h-[3px] w-full bg-blue-800 rounded transition-all duration-300 ease-in-out ${
              isOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'
            }`}
          ></span>
          <span 
            className={`bar h-[3px] w-full bg-blue-800 rounded transition-all duration-500 ease-in-out transform origin-center ${
              isOpen ? '-rotate-45 -translate-y-[10px]' : ''
            }`}
          ></span>
        </div>
      </button>

      {/* RIGHT-ALIGNED FLOATING DROPDOWN MENU */}
      <div 
        className={`absolute right-0 top-14 z-[9999] w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 transition-all duration-300 ease-in-out transform origin-top-right ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="flex flex-col p-4 max-h-[85vh] overflow-y-auto">
          
          {/* USER PROFILE CARD */}
          {user && (
            <div className="bg-blue-50 p-4 rounded-xl mb-4 border border-blue-100 flex items-center gap-3 shadow-sm shrink-0">
              <div className="bg-blue-200 text-blue-700 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] text-blue-500 font-semibold uppercase tracking-wider">Signed in</p>
                <p className="text-blue-900 font-bold truncate text-xs">{user.email}</p>
              </div>
            </div>
          )}

          {/* NAVIGATION LINKS */}
          <nav className="flex flex-col space-y-1 shrink-0">
            {/* HOME */}
            <Link 
              href="/" 
              onClick={() => setIsOpen(false)}
              className="group flex items-center gap-3 p-3 rounded-xl text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all border border-transparent hover:border-blue-100"
            >
              <div className="bg-gray-100 group-hover:bg-white p-2 rounded-lg transition-colors">
                <FaHome className="text-gray-500 group-hover:text-blue-500 text-sm" />
              </div>
              Home
            </Link>

            {/* POST A JOB (Now integrated in the list) */}
            <button 
              onClick={handlePostJobClick}
              className="group flex items-center gap-3 p-3 rounded-xl text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all border border-transparent hover:border-blue-100 text-left"
            >
              <div className="bg-gray-100 group-hover:bg-white p-2 rounded-lg transition-colors">
                <FaBriefcase className="text-gray-500 group-hover:text-blue-500 text-sm" />
              </div>
              Post a Job
            </button>

            {/* LOGIN / SIGN UP (Only if not logged in) */}
            {!user && (
              <Link 
                href="/auth" 
                onClick={() => setIsOpen(false)}
                className="group flex items-center gap-3 p-3 rounded-xl text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all border border-transparent hover:border-blue-100"
              >
                <div className="bg-gray-100 group-hover:bg-white p-2 rounded-lg transition-colors">
                  <FaSignInAlt className="text-gray-500 group-hover:text-blue-500 text-sm" />
                </div>
                Login / Sign Up
              </Link>
            )}
          </nav>

          {/* LOGOUT BUTTON (Only if logged in) */}
          {user && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col shrink-0">
              <button
                onClick={handleLogout}
                className="w-full bg-red-50 text-red-500 p-3 rounded-xl font-bold text-base flex items-center justify-center gap-2 active:scale-95 transition-transform border border-red-100 hover:bg-red-100"
              >
                <FaSignOutAlt /> Log Out
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
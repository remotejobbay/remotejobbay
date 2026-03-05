'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { 
  FaHome, 
  FaInfoCircle, 
  FaSignInAlt, 
  FaSignOutAlt, 
  FaBriefcase 
} from 'react-icons/fa';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handlePostJobClick = () => {
    setIsOpen(false);
    router.push(user ? '/post' : '/auth');
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    location.reload();
  };

  return (
    <div className="sm:hidden" ref={containerRef}>
      
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

      {/* FULL SCREEN OVERLAY (Fixed layout to prevent cut-offs) */}
      <div 
        className={`fixed left-0 right-0 bottom-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-300 ease-in-out transform ${
          isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'
        }`}
        style={{ top: '60px' }} // Adjust this to match your exact Navbar height
      >
        <div className="flex flex-col h-full p-6 overflow-y-auto">
          
          {/* USER PROFILE CARD */}
          {user && (
            <div className="bg-blue-50 p-5 rounded-2xl mb-6 border border-blue-100 flex items-center gap-4 shadow-sm shrink-0">
              <div className="bg-blue-200 text-blue-700 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-blue-500 font-semibold uppercase tracking-wider">Signed in as</p>
                <p className="text-blue-900 font-bold truncate text-sm">{user.email}</p>
              </div>
            </div>
          )}

          {/* NAVIGATION LINKS */}
          <nav className="flex flex-col space-y-2 shrink-0">
            <Link 
              href="/" 
              onClick={() => setIsOpen(false)}
              className="group flex items-center gap-4 p-3 rounded-xl text-lg font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all border border-transparent hover:border-blue-100"
            >
              <div className="bg-gray-100 group-hover:bg-white p-2.5 rounded-lg transition-colors">
                <FaHome className="text-gray-500 group-hover:text-blue-500" />
              </div>
              Home
            </Link>

            <Link 
              href="/about" 
              onClick={() => setIsOpen(false)}
              className="group flex items-center gap-4 p-3 rounded-xl text-lg font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all border border-transparent hover:border-blue-100"
            >
              <div className="bg-gray-100 group-hover:bg-white p-2.5 rounded-lg transition-colors">
                <FaInfoCircle className="text-gray-500 group-hover:text-blue-500" />
              </div>
              About Us
            </Link>

            {!user && (
              <Link 
                href="/auth" 
                onClick={() => setIsOpen(false)}
                className="group flex items-center gap-4 p-3 rounded-xl text-lg font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all border border-transparent hover:border-blue-100"
              >
                <div className="bg-gray-100 group-hover:bg-white p-2.5 rounded-lg transition-colors">
                  <FaSignInAlt className="text-gray-500 group-hover:text-blue-500" />
                </div>
                Login / Sign Up
              </Link>
            )}
          </nav>

          {/* ACTION BUTTONS (Pushed safely to the bottom area) */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-4 pb-8 shrink-0">
            <button
              onClick={handlePostJobClick}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <FaBriefcase /> Post a Job
            </button>

            {user && (
              <button
                onClick={handleLogout}
                className="w-full bg-red-50 text-red-500 p-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform border border-red-100 hover:bg-red-100"
              >
                <FaSignOutAlt /> Log Out
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
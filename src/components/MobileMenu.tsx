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
  FaBriefcase, 
  FaUserCircle,
  FaTimes,
  FaBars
} from 'react-icons/fa';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  
  // We don't need the click outside logic as much for a full-screen menu,
  // but it's good practice to keep the ref for accessibility/focus management.
  const containerRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when menu is open so the background doesn't scroll
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
      {/* 1. THE TRIGGER BUTTON (Big and Easy to Tap) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 -mr-2 text-blue-800 hover:bg-blue-50 rounded-full transition-colors focus:outline-none"
        aria-label="Toggle Menu"
      >
        {/* Swapping Icon based on state */}
        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* 2. THE FULL SCREEN OVERLAY */}
      {/* This covers the whole screen so users can't miss */}
      <div 
        className={`fixed inset-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-300 ease-in-out transform ${
          isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'
        }`}
        style={{ top: '60px' }} // Adjust this value to match your Navbar height
      >
        <div className="flex flex-col h-full p-6 overflow-y-auto pb-20">
          
          {/* USER PROFILE CARD (If logged in) */}
          {user && (
            <div className="bg-blue-50 p-5 rounded-2xl mb-8 border border-blue-100 flex items-center gap-4 shadow-sm">
              <div className="bg-blue-200 text-blue-700 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-blue-500 font-semibold uppercase tracking-wider">Signed in as</p>
                <p className="text-blue-900 font-bold truncate text-sm">{user.email}</p>
              </div>
            </div>
          )}

          {/* NAVIGATION LINKS - Styled as Big Rows */}
          <nav className="flex flex-col space-y-3">
            
            <Link 
              href="/" 
              onClick={() => setIsOpen(false)}
              className="group flex items-center gap-4 p-4 rounded-xl text-lg font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all active:scale-98 border border-transparent hover:border-blue-100"
            >
              <div className="bg-gray-100 group-hover:bg-white p-2.5 rounded-lg transition-colors">
                <FaHome className="text-gray-500 group-hover:text-blue-500" />
              </div>
              Home
            </Link>

            <Link 
              href="/about" 
              onClick={() => setIsOpen(false)}
              className="group flex items-center gap-4 p-4 rounded-xl text-lg font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all active:scale-98 border border-transparent hover:border-blue-100"
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
                className="group flex items-center gap-4 p-4 rounded-xl text-lg font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all active:scale-98 border border-transparent hover:border-blue-100"
              >
                <div className="bg-gray-100 group-hover:bg-white p-2.5 rounded-lg transition-colors">
                  <FaSignInAlt className="text-gray-500 group-hover:text-blue-500" />
                </div>
                Login / Sign Up
              </Link>
            )}

            {/* ACTION BUTTONS */}
            <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col gap-4">
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

          </nav>
        </div>
      </div>
    </div>
  );
}
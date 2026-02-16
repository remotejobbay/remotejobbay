'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  
  // 1. Move ref to the container to handle clicks on the button AND the menu correctly
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePostJobClick = () => {
    setIsOpen(false);
    router.push(user ? '/post' : '/auth');
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    location.reload();
  };

  // 2. Click outside logic
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If the menu is open, and the click is NOT inside our container
      if (
        isOpen && 
        containerRef.current && 
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]); // Added isOpen dependency to keep it clean

  return (
    <div className="relative sm:hidden" ref={containerRef}>
      {/* 3. CLEANED UP: Only using ONE burger style. 
          If you preferred the animation of burger3, change the class below to "burger burger3" 
      */}
      <label className="burger burger1" htmlFor="mobile-toggle">
        <input
          id="mobile-toggle"
          type="checkbox"
          className="hidden"
          checked={isOpen}
          onChange={() => setIsOpen(!isOpen)}
        />
        <span></span>
      </label>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-blue-50 rounded-2xl shadow-2xl border border-blue-100 z-50 animate-fade-in origin-top-right">
          <nav className="flex flex-col px-5 py-4 text-sm text-blue-900 font-medium space-y-3">
            <Link href="/" onClick={() => setIsOpen(false)} className="hover:text-blue-600 transition">
              Home
            </Link>
            <Link href="/about" onClick={() => setIsOpen(false)} className="hover:text-blue-600 transition">
              About
            </Link>

            {user ? (
              <>
                <div className="border-t border-blue-200 my-2 pt-2">
                  <p className="text-xs text-blue-400 mb-2 truncate">
                    Signed in as: <br />
                    <span className="font-semibold text-blue-600">{user.email}</span>
                  </p>
                  <button
                    onClick={handleLogout}
                    className="text-left text-red-500 hover:text-red-700 hover:underline text-sm w-full"
                  >
                    Log out
                  </button>
                </div>
              </>
            ) : (
              <Link href="/auth" onClick={() => setIsOpen(false)} className="hover:text-blue-600 transition">
                Login
              </Link>
            )}

            <button
              onClick={handlePostJobClick}
              className="mt-2 w-full bg-blue-600 text-white text-center py-2.5 rounded-xl font-semibold shadow-md hover:bg-blue-700 transition transform active:scale-95"
            >
              Post a Job
            </button>
          </nav>

          <div className="text-center text-[10px] text-blue-400 py-2 border-t border-blue-100 bg-blue-50/50 rounded-b-2xl">
            © {new Date().getFullYear()} RemoteJobBay
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState, useRef, useEffect } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const handlePostJobClick = () => {
    setIsOpen(false);
    router.push(user ? '/post' : '/login');
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    location.reload();
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative sm:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-white p-2 rounded-md bg-blue-600 hover:bg-blue-700"
        aria-label="Toggle menu"
      >
        {isOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 animate-fade-in"
        >
          <nav className="flex flex-col px-4 py-3 text-sm text-gray-700 space-y-2">
            <Link href="/" onClick={() => setIsOpen(false)}>Home</Link>
            <Link href="/jobs" onClick={() => setIsOpen(false)}>Browse Jobs</Link>
            <Link href="/about" onClick={() => setIsOpen(false)}>About</Link>

            {user ? (
              <>
                <span className="text-xs text-gray-500">Welcome, {user.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-left text-red-500 hover:underline"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsOpen(false)}>Login</Link>
                <Link href="/signup" onClick={() => setIsOpen(false)}>Create Account</Link>
              </>
            )}

            <button
              onClick={handlePostJobClick}
              className="mt-3 bg-blue-600 text-white text-center py-2 rounded-md hover:bg-blue-700"
            >
              Post a Job – Free
            </button>
          </nav>

          <div className="text-center text-xs text-gray-400 py-3 border-t">
            © {new Date().getFullYear()} RemoteJobBay
          </div>
        </div>
      )}
    </div>
  );
}

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
        className="text-white p-3 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
        aria-label="Toggle menu"
      >
        {isOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-3 w-64 bg-blue-50 rounded-2xl shadow-2xl border border-blue-100 z-50 animate-fade-in"
        >
          <nav className="flex flex-col px-5 py-4 text-sm text-blue-900 font-medium space-y-3">
            <Link href="/" onClick={() => setIsOpen(false)} className="hover:underline">Home</Link>
            <Link href="/about" onClick={() => setIsOpen(false)} className="hover:underline">About</Link>

            {user ? (
              <>
                <span className="text-xs text-blue-500">Welcome, {user.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-left text-red-600 hover:underline"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsOpen(false)} className="hover:underline">Login</Link>
                <Link href="/signup" onClick={() => setIsOpen(false)} className="hover:underline">Create Account</Link>
              </>
            )}

            <button
              onClick={handlePostJobClick}
              className="mt-3 bg-blue-600 text-white text-center py-2 rounded-md hover:bg-blue-700 transition"
            >
              Post a Job – Free
            </button>
          </nav>

          <div className="text-center text-xs text-blue-400 py-3 border-t border-blue-100">
            © {new Date().getFullYear()} RemoteJobBay
          </div>
        </div>
      )}
    </div>
  );
}

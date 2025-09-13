'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';

// Note: Removed FaBars and FaTimes since we're using custom hamburger CSS

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const handlePostJobClick = () => {
    setIsOpen(false);
    router.push(user ? '/post' : '/auth');
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
      <div className="burgers">
        <label className="burger burger1" htmlFor="burger1">
          <input
            id="burger1"
            type="checkbox"
            className="hidden"
            checked={isOpen}
            onChange={() => setIsOpen(!isOpen)}
          />
          <span></span>
        </label>
        <label className="burger burger2" htmlFor="burger2">
          <input
            id="burger2"
            type="checkbox"
            className="hidden"
            checked={isOpen}
            onChange={() => setIsOpen(!isOpen)}
          />
          <span></span>
        </label>
        <label className="burger burger3" htmlFor="burger3">
          <input
            id="burger3"
            type="checkbox"
            className="hidden"
            checked={isOpen}
            onChange={() => setIsOpen(!isOpen)}
          />
          <span></span>
        </label>
        <label className="burger burger4" htmlFor="burger4">
          <input
            id="burger4"
            type="checkbox"
            className="hidden"
            checked={isOpen}
            onChange={() => setIsOpen(!isOpen)}
          />
          <span></span>
        </label>
      </div>

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
                <Link href="/auth" onClick={() => setIsOpen(false)} className="hover:underline">Login</Link>
              </>
            )}

            <button
              onClick={handlePostJobClick}
              className="mt-3 bg-blue-600 text-white text-center py-2 rounded-md hover:bg-blue-700 transition"
            >
              Post a Job
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
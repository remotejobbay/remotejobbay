'use client';

import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/utils/supabase/supabaseClient';
import { useRouter } from 'next/navigation';
import MobileMenu from '@/components/MobileMenu';
import { HiMenu } from 'react-icons/hi';

// ✅ Declare gtag type so TypeScript won't complain
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default function Header() {
  const { user } = useUser();
  const router = useRouter();

  const handlePostJobClick = () => {
    // ✅ Google Analytics event tracking (updated label)
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'post_job_click', {
        event_category: 'engagement',
        event_label: 'Post a Job – $100',
      });
    }

    if (user) {
      router.push('/post');
    } else {
      router.push('/login');
    }
  };

  return (
    <header className="bg-gradient-to-br from-teal-900/80 via-indigo-900/80 to-orange-900/80 backdrop-blur-md text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🌍</span>
          <Link
            href="/"
            className="text-2xl font-bold text-yellow-400 hover:text-yellow-500 font-poppins transition-colors duration-200 drop-shadow-sm"
          >
            RemoteJobBay
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm font-medium text-teal-100">
                Welcome, {user.email.split('@')[0]}
              </span>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.reload();
                }}
                className="text-sm bg-red-600/80 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md shadow-md transition duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-teal-200 hover:text-teal-300 font-poppins transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="text-sm font-medium text-teal-200 hover:text-teal-300 font-poppins transition-colors duration-200"
              >
                Create Account
              </Link>
            </>
          )}

          <button
            onClick={handlePostJobClick}
            className="bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white text-sm font-semibold px-5 py-2 rounded-md shadow-lg transition-all duration-200"
          >
            Post a Job – $100
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="sm:hidden">
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
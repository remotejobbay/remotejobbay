'use client';

import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/utils/supabase/supabaseClient';
import { useRouter } from 'next/navigation';
import MobileMenu from '@/components/MobileMenu';
import { FaPaperPlane } from 'react-icons/fa';

// Declare gtag type for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default function Header() {
  const { user } = useUser();
  const router = useRouter();

  const handlePostJobClick = () => {
    // Google Analytics event tracking
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'post_job_click', {
        event_category: 'engagement',
        event_label: 'Post a Job',
      });
    }

    if (user) {
      router.push('/post');
    } else {
      router.push('/auth'); // Redirects to unified auth page
    }
  };

  return (
    <header className="bg-gradient-to-br from-mint-200/80 via-mint-300/80 to-mint-200/80 backdrop-blur-md text-gray-800 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <span className="text-2xl animate-pulse duration-1200 text-amber-700">🌍</span>
          <Link
            href="/"
            className="text-xl font-bold text-amber-700 hover:text-amber-600 font-poppins transition-colors duration-300 drop-shadow-sm"
          >
            RemoteJobBay
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center gap-6">
          {user ? (
            <>
              <span className="text-xs font-medium text-gray-600 drop-shadow-sm tracking-wide">
                Welcome, {user.email.split('@')[0]}
              </span>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.reload();
                }}
                className="text-xs bg-red-400 hover:bg-red-500 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth"
                className="text-xs font-medium text-gray-600 hover:text-gray-800 font-poppins transition-colors duration-300 tracking-wide"
              >
                Login
              </Link>
            </>
          )}

          <button
            onClick={handlePostJobClick}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-medium px-5 py-2 rounded-lg shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <FaPaperPlane className="text-xs" />
            Post a Job
          </button>
        </nav>

        {/* Mobile Hamburger Button */}
        <div className="sm:hidden">
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
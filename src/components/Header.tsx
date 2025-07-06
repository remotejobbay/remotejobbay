'use client';

import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/utils/supabase/supabaseClient';
import { useRouter } from 'next/navigation';
import MobileMenu from '@/components/MobileMenu'; // ✅ Import mobile menu
import { HiMenu } from 'react-icons/hi';

export default function Header() {
  const { user } = useUser();
  const router = useRouter();

  const handlePostJobClick = () => {
    if (user) {
      router.push('/post');
    } else {
      router.push('/login');
    }
  };

  return (
    <header className="bg-[#0f172a] text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🌍</span>
          <Link
            href="/"
            className="text-xl font-bold text-yellow-500 hover:text-yellow-600 transition-colors duration-200"
          >
            Remotejobbay
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden sm:flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-white">Welcome, {user.email}</span>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.reload();
                }}
                className="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm hover:text-blue-400 font-medium">
                Login
              </Link>
              <Link href="/signup" className="text-sm hover:text-blue-400 font-medium">
                Create Account
              </Link>
            </>
          )}

          <button
            onClick={handlePostJobClick}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-md shadow transition duration-200"
          >
            Post a Job – Free
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

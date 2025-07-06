'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { HiMenu, HiX } from 'react-icons/hi';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  const handlePostJobClick = () => {
    setIsOpen(false);
    if (user) {
      router.push('/post');
    } else {
      router.push('/login');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    location.reload();
  };

  return (
    <>
      <button
        className="text-white sm:hidden"
        onClick={() => setIsOpen(true)}
      >
        <HiMenu className="w-7 h-7" />
      </button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50 sm:hidden">
        <div className="fixed inset-0 bg-black bg-opacity-40" />
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 w-4/5 max-w-xs h-full bg-white p-6 flex flex-col shadow-xl"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-blue-800">Menu</h2>
            <button onClick={() => setIsOpen(false)} className="text-gray-600">
              <HiX className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex flex-col gap-4 text-lg text-gray-700">
            <Link href="/" onClick={() => setIsOpen(false)}>Home</Link>
            <Link href="/jobs" onClick={() => setIsOpen(false)}>Browse Jobs</Link>
            <Link href="/about" onClick={() => setIsOpen(false)}>About</Link>
            {user ? (
              <>
                <span className="text-sm text-gray-500">Welcome, {user.email}</span>
                <button onClick={handleLogout} className="text-left text-red-600">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsOpen(false)}>Login</Link>
                <Link href="/signup" onClick={() => setIsOpen(false)}>Create Account</Link>
              </>
            )}
            <button
              onClick={handlePostJobClick}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Post a Job – Free
            </button>
          </nav>

          <div className="mt-auto pt-6 text-sm text-gray-400 border-t">
            © {new Date().getFullYear()} RemoteJobBay
          </div>
        </motion.div>
      </Dialog>
    </>
  );
}

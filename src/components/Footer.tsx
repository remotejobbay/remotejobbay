'use client';

import Link from 'next/link';
import { FaXTwitter, FaFacebookF, FaLinkedinIn } from 'react-icons/fa6';
import { useEffect } from 'react';

export default function Footer() {
  useEffect(() => {
    // Small client-side effect to ensure hydration aligns with client rendering
    // This forces a re-render on the client to match the updated className
  }, []);

  return (
    <footer className="bg-gradient-to-br from-teal-900/80 via-indigo-900/80 to-orange-900/80 backdrop-blur-md text-white mt-12 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo and tagline */}
        <div>
          <Link
            href="/"
            className="text-2xl font-bold text-yellow-400 hover:text-yellow-500 font-poppins transition-colors duration-200 drop-shadow-sm"
          >
            🌍 RemoteJobBay
          </Link>
          <p className="text-sm mt-2 text-teal-100 font-medium">
            Discover remote jobs from anywhere in the world.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-teal-200 font-poppins">Quick Links</h3>
          <ul className="space-y-2 text-sm text-indigo-100">
            <li><Link href="/" className="hover:text-teal-300 transition-colors duration-200">Home</Link></li>
            <li><Link href="/post" className="hover:text-teal-300 transition-colors duration-200">Post a Job</Link></li>
            <li><Link href="/categories" className="hover:text-teal-300 transition-colors duration-200">Categories</Link></li>
            <li><Link href="/bookmarks" className="hover:text-teal-300 transition-colors duration-200">Bookmarks</Link></li>
          </ul>
        </div>

        {/* Company Info */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-teal-200 font-poppins">Company</h3>
          <ul className="space-y-2 text-sm text-indigo-100">
            <li><Link href="/about" className="hover:text-teal-300 transition-colors duration-200">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-teal-300 transition-colors duration-200">Contact</Link></li>
            <li><Link href="/legal" className="hover:text-teal-300 transition-colors duration-200">Terms & Privacy</Link></li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-teal-200 font-poppins">Follow Us</h3>
          <div className="flex space-x-4 text-xl text-teal-300">
            <a
              href="https://x.com/remotejobbay?s=21"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-teal-400 transition-colors duration-200"
              aria-label="X"
            >
              <FaXTwitter />
            </a>
            <a
              href="http://facebook.com/Remotejobbay"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-teal-400 transition-colors duration-200"
              aria-label="Facebook"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://www.linkedin.com/in/joel-kings-b58868372?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-teal-400 transition-colors duration-200"
              aria-label="LinkedIn"
            >
              <FaLinkedinIn />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-teal-700/50 mt-6 py-4 text-center text-sm text-teal-100">
        © {new Date().getFullYear()} RemoteJobBay. All rights reserved.
      </div>
    </footer>
  );
}
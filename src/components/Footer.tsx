'use client';

import Link from 'next/link';
import { FaXTwitter, FaFacebookF, FaLinkedinIn } from 'react-icons/fa6';

export default function Footer() {
  return (
    <footer className="bg-white/95 backdrop-blur-lg mt-12 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo and tagline */}
        <div>
          <Link
            href="/"
            className="text-xl font-semibold text-gray-900 hover:text-indigo-600 font-sans transition-colors duration-200"
          >
            🌍 RemoteJobBay
          </Link>
          <p className="text-sm mt-2 text-gray-600 font-medium">
            Discover remote jobs from anywhere in the world.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-gray-700 font-sans">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><Link href="/" className="hover:text-indigo-600 transition-colors duration-200">Home</Link></li>
            <li><Link href="/post" className="hover:text-indigo-600 transition-colors duration-200">Post a Job</Link></li>
            <li><Link href="/categories" className="hover:text-indigo-600 transition-colors duration-200">Categories</Link></li>
            <li><Link href="/bookmarks" className="hover:text-indigo-600 transition-colors duration-200">Bookmarks</Link></li>
          </ul>
        </div>

        {/* Company Info */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-gray-700 font-sans">Company</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><Link href="/about" className="hover:text-indigo-600 transition-colors duration-200">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-indigo-600 transition-colors duration-200">Contact</Link></li>
            <li><Link href="/legal" className="hover:text-indigo-600 transition-colors duration-200">Terms & Privacy</Link></li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-gray-700 font-sans">Follow Us</h3>
          <div className="flex space-x-4 text-xl text-gray-600">
            <a
              href="https://x.com/remotejobbay?s=21"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-600 transition-colors duration-200"
              aria-label="X"
            >
              <FaXTwitter />
            </a>
            <a
              href="http://facebook.com/Remotejobbay"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-600 transition-colors duration-200"
              aria-label="Facebook"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://www.linkedin.com/in/joel-kings-b58868372?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-600 transition-colors duration-200"
              aria-label="LinkedIn"
            >
              <FaLinkedinIn />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 mt-6 py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} RemoteJobBay. All rights reserved.
      </div>
    </footer>
  );
}
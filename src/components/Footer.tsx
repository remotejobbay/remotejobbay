'use client';

import Link from 'next/link';
import { FaXTwitter, FaFacebookF, FaLinkedinIn } from 'react-icons/fa6';

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-white mt-12">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Link
            href="/"
            className="text-2xl font-bold text-yellow-500 hover:text-yellow-400 transition"
          >
            🌍 Remotejobbay
          </Link>
          <p className="text-sm mt-2 text-gray-400">
            Find remote jobs you can do from anywhere.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3 text-gray-300">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/" className="hover:text-blue-300">Home</Link></li>
            <li><Link href="/post" className="hover:text-blue-300">Post a Job</Link></li>
            <li><Link href="/categories" className="hover:text-blue-300">Categories</Link></li>
            <li><Link href="/bookmarks" className="hover:text-blue-300">Bookmarks</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3 text-gray-300">Company</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/about" className="hover:text-blue-300">About Us</Link></li>
            <li><Link href="/advertise" className="hover:text-blue-300">Advertise</Link></li>
            <li><Link href="/contact" className="hover:text-blue-300">Contact</Link></li>
            <li><Link href="/legal" className="hover:text-blue-300">Terms & Privacy</Link></li>

          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3 text-gray-300">Follow Us</h3>
          <div className="flex space-x-4 text-2xl text-blue-400">
            <a
              href="https://x.com/remotejobbay?s=21"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-500"
              aria-label="X"
            >
              <FaXTwitter />
            </a>
            <a
              href="http://facebook.com/Remotejobbay"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-500"
              aria-label="Facebook"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://www.linkedin.com/in/joel-kings-b58868372?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-500"
              aria-label="LinkedIn"
            >
              <FaLinkedinIn />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-8 py-4 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Global Remote Jobs. All rights reserved.
      </div>
    </footer>
  );
}

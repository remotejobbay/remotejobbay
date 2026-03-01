'use client';

import Link from 'next/link';
import { FaXTwitter, FaFacebookF, FaLinkedinIn } from 'react-icons/fa6';

export default function Footer() {
  return (
    <footer className="bg-[#1f2937] text-white mt-12 pt-[60px] pb-[20px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
        
        {/* Logo and tagline */}
        <div>
          <Link
            href="/"
            className="text-xl font-semibold text-white hover:text-[#2563eb] font-sans transition-colors duration-200 flex items-center gap-2"
          >
            🌍 RemoteJobBay
          </Link>
          <p className="text-sm mt-4 text-white/80 font-medium leading-relaxed">
            Discover remote jobs from anywhere in the world.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-5 text-white font-sans">Quick Links</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/" className="text-white/80 hover:text-white hover:pl-1.5 transition-all duration-300 block">
                Home
              </Link>
            </li>
            <li>
              <Link href="/post" className="text-white/80 hover:text-white hover:pl-1.5 transition-all duration-300 block">
                Post a Job
              </Link>
            </li>
            <li>
              <Link href="/categories" className="text-white/80 hover:text-white hover:pl-1.5 transition-all duration-300 block">
                Categories
              </Link>
            </li>
            <li>
              <Link href="/bookmarks" className="text-white/80 hover:text-white hover:pl-1.5 transition-all duration-300 block">
                Bookmarks
              </Link>
            </li>
          </ul>
        </div>

        {/* Company Info */}
        <div>
          <h3 className="text-lg font-semibold mb-5 text-white font-sans">Company</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/about" className="text-white/80 hover:text-white hover:pl-1.5 transition-all duration-300 block">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-white/80 hover:text-white hover:pl-1.5 transition-all duration-300 block">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/legal" className="text-white/80 hover:text-white hover:pl-1.5 transition-all duration-300 block">
                Terms & Privacy
              </Link>
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold mb-5 text-white font-sans">Follow Us</h3>
          <div className="flex gap-4">
            <a
              href="https://x.com/remotejobbay?s=21"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center bg-white/10 rounded-full text-white/90 hover:bg-[#2563eb] hover:text-white transition-all duration-300"
              aria-label="X"
            >
              <FaXTwitter size={18} />
            </a>
            <a
              href="http://facebook.com/Remotejobbay"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center bg-white/10 rounded-full text-white/90 hover:bg-[#2563eb] hover:text-white transition-all duration-300"
              aria-label="Facebook"
            >
              <FaFacebookF size={18} />
            </a>
            <a
              href="https://www.linkedin.com/in/joel-kings-b58868372?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center bg-white/10 rounded-full text-white/90 hover:bg-[#2563eb] hover:text-white transition-all duration-300"
              aria-label="LinkedIn"
            >
              <FaLinkedinIn size={18} />
            </a>
          </div>
        </div>
      </div>

      {/* Footer Bottom / Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-white/10 pt-5 pb-2 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/70">
          <p>© {new Date().getFullYear()} RemoteJobBay. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/legal" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/legal" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
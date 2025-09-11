'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/utils/supabase/supabaseClient'; // Adjust if using API instead

export default function EmailSubscription() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      const { error } = await supabase.from('subscribers').insert({ email }); // Replace with fetch if using API
      if (error) {
        setMessage('Error subscribing. Please try again.');
      } else {
        setSubmitted(true);
        setEmail('');
        setMessage('✅ Thank you! Alerts will arrive soon.');

        // ✅ Google Analytics event
        if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
          window.gtag('event', 'email_subscribed', {
            event_category: 'engagement',
            event_label: 'Homepage Subscription',
          });
        }
      }
    } catch (err) {
      console.error(err);
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-[100vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card-content max-w-xl bg-white rounded-xl p-6 shadow-lg text-center transform -translate-y-1/2"
      >
        <div className="fas fa-envelope bg-teal-600 text-white rounded-full p-4 mb-4 inline-block">
          {/* Replace with an envelope icon if desired; using a div as a placeholder */}
        </div>
        <h2 className="text-2xl font-bold text-teal-800 font-poppins uppercase mb-4">
          Get Exclusive Remote Job Alerts
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Stay updated with the latest remote opportunities tailored for you.
        </p>
        {submitted ? (
          <p className="text-teal-600 font-medium text-base">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="px-4 py-2 rounded-full border border-gray-300 w-full sm:w-2/3 focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm text-sm text-gray-800 placeholder-gray-400"
              required
            />
            <button
              type="submit"
              className="subscribe-btn w-full sm:w-auto px-6 py-2 rounded-full bg-gradient-to-r from-teal-600 to-indigo-700 text-white font-semibold shadow-md hover:from-teal-700 hover:to-indigo-800 transition-all duration-200"
            >
              Subscribe
            </button>
          </form>
        )}
        {message && !submitted && <p className="text-red-500 text-sm mt-2">{message}</p>}
      </motion.div>
    </div>
  );
}
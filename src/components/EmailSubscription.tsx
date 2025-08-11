'use client';

import { useState } from 'react';

export default function EmailSubscription() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSubmitted(true);
        setEmail('');

        // ✅ Google Analytics event
        if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
          window.gtag('event', 'email_subscribed', {
            event_category: 'engagement',
            event_label: 'Homepage Subscription',
          });
        }
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again.');
    }
  };

  return (
    <div className="bg-gradient-to-br from-teal-100/80 via-indigo-100/80 to-orange-100/80 backdrop-blur-md p-4 rounded-xl text-center shadow-lg border border-teal-200/70 mt-8">
      <h2 className="text-xl font-semibold mb-3 text-teal-800 font-poppins drop-shadow-sm">
        Get Exclusive Remote Job Alerts
      </h2>
      {submitted ? (
        <p className="text-teal-600 font-medium text-base">
          ✅ Thank you! Alerts will arrive soon.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row justify-center items-center gap-2 mt-3"
        >
          <input
            type="email"
            placeholder="Enter your email"
            className="px-4 py-2 rounded-lg border border-gray-200 w-full sm:w-auto bg-white/90 backdrop-blur-sm text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-200 shadow-md text-gray-800"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white font-semibold px-5 py-2 rounded-lg shadow-md transition-all duration-200 mt-2 sm:mt-0"
          >
            Subscribe
          </button>
        </form>
      )}
    </div>
  );
}
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
    <div className="bg-blue-50 p-6 rounded-lg text-center mt-10 shadow-sm border border-blue-100">
      <h2 className="text-lg font-semibold mb-2 text-gray-700">Get Remote Job Alerts</h2>
      {submitted ? (
        <p className="text-green-600">✅ Thank you! You'll start receiving alerts soon.</p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-4"
        >
          <input
            type="email"
            placeholder="Enter your email"
            className="px-4 py-3 rounded-lg border border-gray-300 w-full sm:w-auto shadow-sm text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-semibold px-6 py-3 rounded-lg shadow transition duration-300"
          >
            Subscribe
          </button>
        </form>
      )}
    </div>
  );
}

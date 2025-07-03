'use client';

import { useState } from 'react';

export default function EmailSubscription() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail('');
    // Normally you'd post to an API here
  };

  return (
    <div className="bg-blue-50 p-6 rounded-lg text-center mt-10">
      <h2 className="text-lg font-semibold mb-2 text-gray-700">Get Remote Job Alerts</h2>
      {submitted ? (
        <p className="text-green-600">Thank you! You'll start receiving alerts soon.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="px-4 py-2 rounded border w-full sm:w-auto"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Subscribe
          </button>
        </form>
      )}
    </div>
  );
}

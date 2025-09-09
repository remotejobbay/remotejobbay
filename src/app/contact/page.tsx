'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/utils/supabase/supabaseClient';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSubmitted(false);

    const { error } = await supabase.from('contact_messages').insert([form]);

    setLoading(false);

    if (error) {
      console.error('❌ Error saving message:', error.message);
      setError('❌ Something went wrong. Please try again.');
      return;
    }

    setSubmitted(true);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <main className="max-w-3xl mx-auto p-6 min-h-screen bg-gradient-to-br from-teal-50 via-purple-50 to-orange-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-teal-200/70"
      >
        <h1 className="text-4xl font-extrabold mb-6 text-gray-800 text-center drop-shadow-md">
          📧 Contact Us
        </h1>

        {submitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-100 text-green-800 p-4 rounded-lg mb-6 text-center shadow-md"
          >
            ✅ Thank you for reaching out! We will get back to you shortly.
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-100 text-red-800 p-4 rounded-lg mb-6 text-center shadow-md"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm placeholder-gray-400 text-gray-700 transition-all duration-200"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm placeholder-gray-400 text-gray-700 transition-all duration-200"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <textarea
              name="message"
              placeholder="Your Message"
              required
              value={form.message}
              onChange={handleChange}
              className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm placeholder-gray-400 text-gray-700 h-40 resize-none transition-all duration-200"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-teal-600 hover:to-indigo-700 shadow-lg disabled:opacity-70 transition-all duration-200"
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </main>
  );
}
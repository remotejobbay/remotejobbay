'use client';
import { useState } from 'react';
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
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Contact Us</h1>

      {submitted && (
        <div className="bg-green-100 text-green-800 p-4 rounded mb-4">
          ✅ Thank you for reaching out! We will get back to you shortly.
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          required
          value={form.name}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />

        <input
          type="email"
          name="email"
          placeholder="Your Email"
          required
          value={form.email}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />

        <textarea
          name="message"
          placeholder="Your Message"
          required
          value={form.message}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded h-32"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </main>
  );
}

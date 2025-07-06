'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/supabaseClient';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock } from 'react-icons/fa';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
    } else {
      alert('Signup successful! Check your inbox to confirm your email.');
      router.push('/login');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-green-50 to-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white shadow-xl rounded-xl p-6 sm:p-8 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">📝 Create Your Account</h2>

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-3 top-3.5 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">
              ⚠️ {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded font-semibold transition-all duration-200"
          >
            Sign Up
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 font-semibold hover:underline">
            Log in
          </a>
        </p>
      </motion.div>
    </main>
  );
}

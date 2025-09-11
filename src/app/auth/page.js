'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/supabaseClient';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock } from 'react-icons/fa';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      // Login logic
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
      else {
        alert('Login successful!');
        router.push('/');
      }
    } else {
      // Signup logic
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else {
        alert('Signup successful! Check your inbox to confirm your email.');
        setIsLogin(true); // Switch to login mode after successful signup
      }
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-teal-100 to-indigo-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <form
          className="form space-y-6 p-6 bg-white/20 backdrop-blur-sm rounded-lg shadow-md"
          autoComplete="off"
          onSubmit={handleAuth}
        >
          <div className="control text-center">
            <h1 className="text-3xl font-bold text-teal-800 font-poppins mb-4">
              {isLogin ? 'Sign In' : '📝 Create Your Account'}
            </h1>
          </div>

          <div className="control block-cube block-input">
            <div className="bg-top">
              <div className="bg-inner" />
            </div>
            <div className="bg-right">
              <div className="bg-inner" />
            </div>
            <div className="bg">
              <div className="bg-inner" />
            </div>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-600" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 bg-white text-gray-800 placeholder-gray-500 border border-teal-200 rounded-md pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-400"
                required
              />
            </div>
          </div>

          <div className="control block-cube block-input">
            <div className="bg-top">
              <div className="bg-inner" />
            </div>
            <div className="bg-right">
              <div className="bg-inner" />
            </div>
            <div className="bg">
              <div className="bg-inner" />
            </div>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-600" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 bg-white text-gray-800 placeholder-gray-500 border border-teal-200 rounded-md pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-400"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-100 border border-red-200 p-2 rounded-md text-center">
              ⚠️ {error}
            </p>
          )}

          <motion.button
            type="submit"
            className="btn block-cube block-cube-hover w-full mt-6"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="bg-top">
              <div className="bg-inner" />
            </div>
            <div className="bg-right">
              <div className="bg-inner" />
            </div>
            <div className="bg">
              <div className="bg-inner" />
            </div>
            <span className="text text-teal-800 font-semibold text-lg">
              {isLogin ? 'Log In' : 'Sign Up'}
            </span>
          </motion.button>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              {isLogin
                ? "Don't have an account? "
                : 'Already have an account? '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-teal-600 font-semibold hover:underline focus:outline-none"
              >
                {isLogin ? 'Create one' : 'Log in'}
              </button>
            </p>
          </div>
        </form>
      </motion.div>
    </main>
  );
}
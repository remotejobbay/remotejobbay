'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/supabaseClient';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form onSubmit={handleSignup} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Create Account</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded font-semibold"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}

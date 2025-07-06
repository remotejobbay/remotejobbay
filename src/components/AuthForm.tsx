// src/components/AuthForm.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase/supabaseClient';

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleEmailLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    setMessage(error ? error.message : 'Logged in!');
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) setMessage(error.message);
  };

  return (
    <div className="space-y-4">
      <input
        type="email"
        placeholder="Email"
        className="border px-4 py-2 w-full"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="border px-4 py-2 w-full"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleEmailLogin} className="bg-blue-600 text-white px-4 py-2">
        {loading ? 'Logging in...' : 'Login with Email'}
      </button>
      <button onClick={handleGoogleLogin} className="bg-red-600 text-white px-4 py-2 w-full">
        Continue with Google
      </button>
      {message && <p className="text-red-500">{message}</p>}
    </div>
  );
}

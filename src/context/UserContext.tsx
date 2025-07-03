'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/supabaseClient';

const UserContext = createContext<any>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get the currently logged-in user
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUser();

    // Listen for login/logout changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);

'use client';

import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Show nothing or loading screen while checking auth
  if (loading || !user) {
    return (
      <div className="text-center py-20 text-gray-600">
        Checking authentication...
      </div>
    );
  }

  return <>{children}</>;
}

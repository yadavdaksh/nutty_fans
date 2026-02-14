'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ProfileRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace(`/profile/${user.uid}`);
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <ProtectedRoute>
      <div 
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: '#F9FAFB' }}
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 
            className="w-10 h-10 animate-spin"
            style={{ color: '#9810FA' }}
          />
          <p 
            className="font-medium"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              color: '#4A5565',
            }}
          >
            Loading your profile...
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}

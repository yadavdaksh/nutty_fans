'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!userProfile) {
        // Ghost User Check: Authenticated but no profile -> Onboarding
        router.push('/onboarding');
      } else if (!userProfile.onboardingCompleted) {
        // Strict Authorization: MUST complete onboarding (both users and creators)
        router.push('/onboarding');
      } else if (!userProfile.isAgeVerified) {
        // Strict Age Check
        router.push('/onboarding');
      } else if (pathname.startsWith('/admin') && userProfile.role !== 'admin') {
        // Role check for admin routes
        router.push('/dashboard');
      }
    }
  }, [user, userProfile, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }
  
  const needsOnboarding = (!userProfile || !userProfile.onboardingCompleted || !userProfile.isAgeVerified) && 
                         !pathname.startsWith('/onboarding') && 
                         !pathname.startsWith('/verify-age');

  if (needsOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }
  
  return <>{children}</>;
}

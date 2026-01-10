'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LandingPage from '@/components/home/LandingPage';
import LoggedInHome from '@/components/home/LoggedInHome';

export default function Home() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
       if (!userProfile) {
         router.push('/onboarding');
       } else if (!userProfile.onboardingCompleted) {
         router.push('/onboarding');
       } else if (!userProfile.isAgeVerified) {
         router.push('/onboarding');
       }
    }
  }, [user, userProfile, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (user) {
    const needsOnboarding = !userProfile || !userProfile.onboardingCompleted || !userProfile.isAgeVerified;
    if (needsOnboarding) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      );
    }
    return <LoggedInHome />;
  }

  return <LandingPage />;
}

'use client';

import { useAuth } from '@/context/AuthContext';
import LandingPage from '@/components/home/LandingPage';
import LoggedInHome from '@/components/home/LoggedInHome';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (user) {
    return <LoggedInHome />;
  }

  return <LandingPage />;
}

'use client';

import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading } = useAuth();
  const pathname = usePathname();
  
  const isOnboarding = pathname.startsWith('/onboarding');
  const isCreator = userProfile?.role === 'creator';
  
  // Routes that have the Sidebar (Dashboard logic)
  const sidebarRoutes = ['/discover', '/messages', '/live', '/cart', '/subscription', '/notifications', '/settings', '/profile'];
  const isSidebarPage = (user && pathname === '/') || sidebarRoutes.some(route => pathname.startsWith(route));
  
  // Creators should see the Header even on "sidebar pages" because they don't have a sidebar
  const shouldHideHeader = isOnboarding || (isSidebarPage && !isCreator);
  const shouldHideFooter = isOnboarding || pathname.startsWith('/messages'); // Hide footer on messages for full height chat

  if (loading) return null;

  return (
    <>
      {!shouldHideHeader && <Header />}
      <main className="flex-grow">
        {children}
      </main>
      {!shouldHideFooter && (
        <div className={`w-full ${isSidebarPage && !isCreator ? 'pl-[276px]' : ''}`}>
          <Footer />
        </div>
      )}
    </>
  );
}

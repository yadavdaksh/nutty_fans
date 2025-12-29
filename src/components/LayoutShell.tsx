'use client';

import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useChatNotifications } from "@/hooks/useChatNotifications";
import { useIncomingCalls } from "@/hooks/useIncomingCalls";
import { Phone, Video, X, Check } from "lucide-react";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading } = useAuth();
  const pathname = usePathname();

  useChatNotifications();
  const { incomingCall, acceptCall, rejectCall } = useIncomingCalls();
  
  const isOnboarding = pathname.startsWith('/onboarding');
  const isCreator = userProfile?.role === 'creator';
  
  // Routes that have the Sidebar (Dashboard logic)
  const sidebarRoutes = ['/discover', '/messages', '/live', '/cart', '/subscription', '/notifications', '/settings', '/profile'];
  const isSidebarPage = (user && pathname === '/') || sidebarRoutes.some(route => pathname.startsWith(route));
  
  // Routes that should be full screen (no header/footer)
  const isFullScreenPage = pathname === '/live/go-live' || (pathname.startsWith('/live/') && pathname.split('/').length === 3);

  // Creators should see the Header even on "sidebar pages" because they don't have a sidebar
  const shouldHideHeader = isOnboarding || isFullScreenPage || (isSidebarPage && !isCreator);
  const shouldHideFooter = isOnboarding || isFullScreenPage || pathname.startsWith('/messages'); // Hide footer on messages for full height chat

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

      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center w-full max-w-sm mx-4">
              <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mb-6 animate-pulse ring-4 ring-purple-500/20">
                  {incomingCall.type === 'video' ? (
                    <Video className="w-10 h-10 text-purple-400" />
                  ) : (
                    <Phone className="w-10 h-10 text-purple-400" />
                  )}
              </div>
              
              <h3 className="text-xl font-bold text-white mb-1">Incoming {incomingCall.type === 'video' ? 'Video' : 'Audio'} Call</h3>
              <p className="text-gray-400 mb-8">{incomingCall.callerName || 'Fan'} is calling...</p>
              
              <div className="flex gap-6 w-full">
                  <button 
                    onClick={rejectCall}
                    className="flex-1 flex flex-col items-center gap-2 group"
                  >
                     <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white flex items-center justify-center transition-all border border-red-500/20">
                        <X className="w-6 h-6" />
                     </div>
                     <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors">Decline</span>
                  </button>

                  <button 
                    onClick={acceptCall}
                    className="flex-1 flex flex-col items-center gap-2 group"
                  >
                     <div className="w-14 h-14 rounded-full bg-green-500/10 text-green-500 group-hover:bg-green-500 group-hover:text-white flex items-center justify-center transition-all border border-green-500/20 animate-bounce">
                        <Check className="w-6 h-6" />
                     </div>
                     <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors">Accept</span>
                  </button>
              </div>
           </div>
        </div>
      )}
    </>
  );
}

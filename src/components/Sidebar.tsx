'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Search, 
  MessageSquare, 
  Video, 
  Sparkles, 
  Bell, 
  Settings, 
  User 
} from 'lucide-react';
import { query, collection, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, userProfile } = useAuth();
  const [totalUnread, setTotalUnread] = useState(0);

  // Listen for total unread messages
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let count = 0;
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        count += (data.unreadCount?.[user.uid] || 0);
      });
      setTotalUnread(count);
    });

    return () => unsubscribe();
  }, [user?.uid]);
  
  // Hide sidebar for creators as per request
  if (userProfile?.role === 'creator') return null;

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/discover', label: 'Discover', icon: Search },
    { 
      href: '/messages', 
      label: 'Messages', 
      icon: MessageSquare,
      badge: totalUnread > 0 ? totalUnread : null
    },
    { href: '/live', label: 'Live Streams', icon: Video },
    { href: '/subscription', label: 'Subscriptions', icon: Sparkles },
  ];

  return (
    <aside className="fixed left-0 top-0 w-[276px] h-screen bg-white border-r border-gray-200 overflow-y-auto z-40">
      <div className="flex flex-col h-full">
        {/* Logo Area */}
        <div className="px-6 py-8 flex justify-center">
          <Link href="/" className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center mb-2 shadow-lg">
               <span className="text-3xl">🐿️</span>
            </div>
            <span className="font-bold text-2xl tracking-tight text-[#2d0c40]">nuttyfans</span>
            <span className="text-xs text-gray-500 -mt-1 font-medium">get nutty now</span>
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 w-full">
          <ul className="flex flex-col w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            
            return (
              <li key={item.href} className="w-full">
                <Link
                  href={item.href}
                  className={`flex items-center justify-between py-3 px-6 w-full transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#b00b69] to-[#de1d3e] text-white font-medium' 
                      : 'text-[#4a5565] hover:bg-gray-50 hover:text-[#101828] border-b border-gray-100 last:border-0'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#4a5565]'} `} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-[15px] leading-5">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white text-[#de1d3e]' : 'bg-[#de1d3e] text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
          </ul>
        </nav>

        {/* Categories Section - Only on Discover Page */}
        {pathname === '/discover' && (
          <div className="px-6 py-4">
             <h3 className="text-[#98a2b3] font-medium text-sm mb-4">Categories</h3>
             <div className="flex flex-col gap-2">
               {['All', 'Fitness', 'Music', 'Art', 'Photography', 'Gaming', 'Cooking', 'Fashion', 'Comedy'].map((cat, i) => {
                 const isActive = i === 0;
                 return (
                   <button
                     key={i}
                     className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                       isActive
                        ? 'bg-[#e60076] text-white border-[#e60076]'
                        : 'bg-white text-[#344054] border-gray-200 hover:bg-gray-50'
                     }`}
                   >
                     {cat}
                   </button>
                 );
               })}
             </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="mt-auto border-t border-gray-200">
          <ul className="flex flex-col w-full">
            {[
              { href: '/notifications', label: 'Notifications', icon: Bell },
              { href: '/settings', label: 'Settings', icon: Settings },
              { href: '/profile', label: 'Profile', icon: User },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              
              return (
                <li key={item.href} className="w-full">
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 py-3 px-6 w-full transition-all ${
                      isActive 
                        ? 'bg-gradient-to-r from-[#b00b69] to-[#de1d3e] text-white font-medium'
                        : 'text-[#4a5565] hover:bg-gray-50 hover:text-[#101828]'
                    }`}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#4a5565]'} `} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-[15px] leading-5">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </aside>
  );
}



'use client';

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

import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { userProfile } = useAuth();
  
  // Hide sidebar for creators as per request
  if (userProfile?.role === 'creator') return null;

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/discover', label: 'Discover', icon: Search },
    { href: '/messages', label: 'Messages', icon: MessageSquare },
    { href: '/live', label: 'Live Streams', icon: Video },
    { href: '/subscription', label: 'Subscriptions', icon: Sparkles }, // Moving subscriptions here as per design list typically
  ];

  // Note: The design image shows "Subscriptions" in the main list. 
  // I will check if exact list match is needed. 
  // Image shows: Home, Discover, Messages, Live Streams, Cart, Subscriptions. Matches.

  return (
    <aside className="fixed left-0 top-0 w-[276px] h-screen bg-white border-r border-gray-200 overflow-y-auto z-40">
      <div className="flex flex-col h-full">
        {/* Logo Area - Centered and Larger */}
        <div className="px-6 py-8 flex justify-center">
          <Link href="/" className="flex flex-col items-center">
            {/* Placeholder for the Squirrel Logo - Using an emoji or icon for now if actual asset missing, or keeping simpler text */}
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
            // Active if pathname matches exactly for Home, or starts with for others
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            
            return (
              <li key={item.href} className="w-full">
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 py-3 px-6 w-full transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#b00b69] to-[#de1d3e] text-white font-medium' 
                      : 'text-[#4a5565] hover:bg-gray-50 hover:text-[#101828] border-b border-gray-100 last:border-0'
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
        </nav>

        {/* Categories Section - Only on Discover Page */}
        {pathname === '/discover' && (
          <div className="px-6 py-4">
             <h3 className="text-[#98a2b3] font-medium text-sm mb-4">Categories</h3>
             <div className="flex flex-col gap-2">
               {['All', 'Fitness', 'Music', 'Art', 'Photography', 'Gaming', 'Cooking', 'Fashion', 'Comedy', 'Fitness', 'Music'].map((cat, i) => {
                 // Mocking 'All' as active for now
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



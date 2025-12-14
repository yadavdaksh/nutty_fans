'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Search, 
  MessageSquare, 
  Video, 
  ShoppingCart, 
  Sparkles, 
  Bell, 
  Settings, 
  User 
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Home', icon: Home, active: pathname === '/dashboard' },
    { href: '/discover', label: 'Discover', icon: Search },
    { href: '/messages', label: 'Messages', icon: MessageSquare },
    { href: '/live', label: 'Live Streams', icon: Video },
    { href: '/cart', label: 'Cart', icon: ShoppingCart },
  ];

  const bottomNavItems = [
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/settings', label: 'Settings', icon: Settings },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <aside className="fixed left-0 top-[65px] w-[276px] h-[calc(100vh-65px)] bg-white border-r border-gray-200 overflow-y-auto">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="px-[59px] py-[72px]">
          <Link href="/" className="flex items-center">
            <div className="h-10 w-10 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
          </Link>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200 mx-6"></div>

        {/* Main Navigation */}
        <nav className="flex-1 px-6 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.active || pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 py-3 px-0 transition-colors ${
                  isActive 
                    ? 'text-[#434343] font-medium' 
                    : 'text-[#363636] font-normal hover:text-[#434343]'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[15px] leading-6">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="h-px bg-gray-200 mx-6"></div>

        {/* Subscriptions - Highlighted */}
        <div className="px-6 py-4">
          <Link
            href="/subscription"
            className="flex items-center gap-3 py-3 px-0 relative"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-[276px] bg-gradient-to-r from-[#9810fa] via-[#e60076] to-[#ff6900] opacity-20 -ml-6"></div>
            <div className="absolute left-0 top-0 bottom-0 w-[276px] bg-black opacity-20 -ml-6"></div>
            <Sparkles className="w-5 h-5 text-white relative z-10" />
            <span className="text-[15px] leading-6 text-white font-normal relative z-10">Subscriptions</span>
          </Link>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200 mx-6"></div>

        {/* Bottom Navigation */}
        <nav className="px-6 py-4">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 py-3 px-0 transition-colors ${
                  isActive 
                    ? 'text-[#434343] font-medium' 
                    : 'text-[#363636] font-normal hover:text-[#434343]'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[15px] leading-6">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}


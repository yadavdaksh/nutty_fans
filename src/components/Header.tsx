'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Bell, Search, Menu, LogOut, User, Settings, LayoutDashboard, Phone, PhoneOff } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useMessaging } from '@/hooks/useMessaging';
import { createCreatorProfile, getCreatorProfile } from '@/lib/db';
import { toast } from 'react-hot-toast';


export default function Header() {
  const pathname = usePathname();
  const { user, userProfile, signOut } = useAuth();
  const { totalUnreadCount } = useMessaging(user?.uid);
  /* useChatNotifications(); - Removed to avoid duplicate toasts (called in LayoutShell) */
  const isAdminPage = pathname.startsWith('/admin');
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/verify-otp' || pathname === '/verify-age';

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCallsEnabled, setIsCallsEnabled] = useState(false);

  useEffect(() => {
    if (userProfile?.role === 'creator' && user) {
      getCreatorProfile(user.uid).then((profile) => {
        if (profile) setIsCallsEnabled(profile.isCallsEnabled ?? false);
      });
    }
  }, [userProfile, user]);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const mockNotifications = [
    { id: 1, text: 'Sarah Miller subscribed to your Premium tier!', time: '2 mins ago', unread: true },
    { id: 2, text: 'You received a $50 tip from Alex Rivers!', time: '1 hour ago', unread: true },
    { id: 3, text: 'New comment on your latest post', time: '5 hours ago', unread: false },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(target)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsDropdownOpen(false);
  };

  if (isAdminPage) return null;
  // Hide header for regular users as they have the sidebar
  if (userProfile?.role === 'user') return null;

  return (
    <header 
      className="sticky top-0 z-50 h-[65px] border-b border-gray-200 border-l-0 border-r-0 border-t-0 bg-white"
    >
      <div className="max-w-7xl mx-auto h-full">
        <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-[104.5px] py-3">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center h-10">
            {/* Logo - 41.79px x 40px */}
            <Link href="/" className="flex-shrink-0 h-10 w-[41.79px] relative">
              <div className="h-10 w-10 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
            </Link>

            {/* Navigation Links - Hidden on mobile, shown on desktop */}
            {!isAuthPage && (
              <nav className="hidden lg:flex items-center lg:ml-[73.78px] gap-6 h-6">
                <Link 
                  href="/" 
                  className={`text-[15.1px] leading-6 font-normal transition-colors ${
                    pathname === '/' ? 'text-[#101828]' : 'text-[#4a5565] hover:text-[#101828]'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Home
                </Link>
                <Link 
                  href="/discover" 
                  className={`text-[15.1px] leading-6 font-normal transition-colors ${
                    pathname === '/discover' ? 'text-[#101828]' : 'text-[#4a5565] hover:text-[#101828]'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
              Discover
            </Link>

                <Link 
                  href="/messages" 
                  className={`text-[15.1px] leading-6 font-normal transition-colors relative flex items-center gap-1 ${
                    pathname === '/messages' ? 'text-[#101828]' : 'text-[#4a5565] hover:text-[#101828]'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Messages
                  {totalUnreadCount > 0 && userProfile?.role === 'creator' && (
                    <span className="flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-[#e60076] rounded-full">
                      {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                    </span>
                  )}
                </Link>
                <Link 
                  href="/subscription" 
                  className={`text-[15.1px] leading-6 font-normal transition-colors ${
                    pathname === '/subscription' ? 'text-[#101828]' : 'text-[#4a5565] hover:text-[#101828]'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Subscription
                </Link>
                <Link 
                  href={userProfile?.role === 'creator' ? '/live/go-live' : '/live'}
                  className={`text-[15.1px] leading-6 font-normal transition-colors ${
                    pathname === '/live' || pathname === '/live/go-live' ? 'text-[#101828]' : 'text-[#4a5565] hover:text-[#101828]'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Live Stream
                </Link>
                <Link 
                  href="/dashboard" 
                  className={`text-[15.1px] leading-6 font-normal transition-colors ${
                    pathname === '/dashboard' ? 'text-[#101828]' : 'text-[#4a5565] hover:text-[#101828]'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Dashboard
            </Link>
          </nav>
            )}

            {/* Auth Page Navigation */}
            {isAuthPage && (
              <div className="flex items-center ml-6">
                <Link 
                  href="/" 
                  className="text-[15.1px] leading-6 font-normal text-[#4a5565] hover:text-[#101828] transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Back to Home
            </Link>
              </div>
            )}
          </div>

          {/* Right side - Icons and Profile */}
          {!isAuthPage && (
            <div className="flex items-center h-10 gap-0">
              {/* Creator Call Toggle or Search Icon */}
              {userProfile?.role === 'creator' ? (
                <button
                  onClick={async () => {
                    if (!user) return;
                    const newState = !isCallsEnabled;
                    setIsCallsEnabled(newState); // Optimistic update
                    try {
                      await createCreatorProfile(user.uid, { isCallsEnabled: newState });
                      toast.success(newState ? 'Calls Enabled' : 'Calls Disabled');
                    } catch {
                      setIsCallsEnabled(!newState);
                      toast.error('Failed to update status');
                    }
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    isCallsEnabled 
                      ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                      : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                  }`}
                >
                  {isCallsEnabled ? (
                    <>
                      <Phone className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Calls Active</span>
                    </>
                  ) : (
                    <>
                      <PhoneOff className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Calls Disabled</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="relative flex items-center" ref={searchRef}>
                  <div className={`flex items-center overflow-hidden transition-all duration-300 ${isSearchOpen ? 'w-64 opacity-100' : 'w-0 opacity-0'}`}>
                    <input 
                      type="text"
                      placeholder="Search fans or categories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#f9fafb] border border-gray-200 rounded-full px-4 py-1.5 text-[14px] text-[#101828] placeholder:text-[#98a2b3] focus:border-[#9810fa] focus:bg-white outline-none transition-all shadow-sm"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                  <button 
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isSearchOpen ? 'text-purple-600' : 'text-[#4a5565] hover:text-[#101828]'}`}
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    aria-label="Search"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Notifications Icon with Dropdown */}
              <div className="relative ml-4" ref={notificationsRef}>
                <button 
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors relative ${isNotificationsOpen ? 'text-purple-600' : 'text-[#4a5565] hover:text-[#101828]'}`}
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {mockNotifications.some(n => n.unread) && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#e60076] rounded-full border-2 border-white"></span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in duration-200">
                    <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-bold text-sm text-[#101828]" style={{ fontFamily: 'Inter, sans-serif' }}>Notifications</h3>
                      <button className="text-xs text-purple-600 hover:text-purple-700 font-medium">Mark as read</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {mockNotifications.map((notif) => (
                        <div key={notif.id} className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0 flex gap-3 ${notif.unread ? 'bg-purple-50/30' : ''}`}>
                          <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${notif.unread ? 'bg-[#e60076]' : 'opacity-0'}`}></div>
                          <div>
                            <p className="text-sm font-normal text-[#101828] leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>{notif.text}</p>
                            <p className="text-xs text-[#98a2b3] mt-1">{notif.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2 text-center border-t border-gray-100">
                      <button className="text-sm font-medium text-purple-600 hover:text-purple-700">View all notifications</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Image - 40px x 40px, gap of 16px from notifications */}
              <div className="relative ml-4" ref={dropdownRef}>
                {user ? (
                  <>
                    <button 
                      className="w-10 h-10 rounded-full overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all"
                      aria-label="Profile"
                      onClick={toggleDropdown}
                    >
                      {user.photoURL ? (
                        <div className="w-full h-full relative">
                          <Image 
                            src={user.photoURL} 
                            alt={user.displayName || 'User'} 
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                    </button>

                    {/* Dropdown Menu for logged in users */}
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                        <div className="px-4 py-2 border-b border-gray-200">
                          <p className="text-sm font-medium text-[#101828] truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {user.displayName || 'User'}
                          </p>
                          <p className="text-xs font-normal text-[#4a5565] truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {user.email}
                          </p>
                        </div>
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 px-4 py-2 text-sm font-normal text-[#4a5565] hover:bg-gray-50 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </Link>
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 px-4 py-2 text-sm font-normal text-[#4a5565] hover:bg-gray-50 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center gap-2 px-4 py-2 text-sm font-normal text-[#4a5565] hover:bg-gray-50 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                        <div className="border-t border-gray-200 my-1"></div>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm font-normal text-red-600 hover:bg-red-50 transition-colors"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <button 
                      className="w-10 h-10 rounded-full overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all"
                      aria-label="Profile"
                      onClick={toggleDropdown}
                    >
                      <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                        <span className="text-white font-medium text-sm">U</span>
                      </div>
                    </button>

                    {/* Dropdown Menu for logged out users */}
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                        <Link
                          href="/login"
                          className="flex items-center gap-2 px-4 py-2 text-sm font-normal text-[#4a5565] hover:bg-gray-50 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          <User className="w-4 h-4" />
                          Sign In
                        </Link>
                        <Link
                          href="/signup"
                          className="flex items-center gap-2 px-4 py-2 text-sm font-normal text-[#4a5565] hover:bg-gray-50 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          <User className="w-4 h-4" />
                          Sign Up
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Mobile Menu Button */}
          {!isAuthPage && (
            <button 
              className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center text-[#4a5565] hover:text-[#101828] transition-colors"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

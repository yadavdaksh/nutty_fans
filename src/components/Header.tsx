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
import { format } from 'date-fns';


import { useNotifications } from '@/hooks/useNotifications';
export default function Header() {
  const pathname = usePathname();
  const { user, userProfile, signOut } = useAuth();
  const { totalUnreadCount } = useMessaging(user?.uid);
  const { notifications, unreadCount: notificationsUnreadCount, markAllAsRead, dismissNotification } = useNotifications();
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
      className="sticky top-0 z-50 h-[65px] border-b border-l-0 border-r-0 border-t-0"
      style={{
        backgroundColor: '#FFFFFF',
        borderBottomColor: '#E5E7EB',
      }}
    >
      <div className={`${isAuthPage ? 'w-full' : 'max-w-7xl mx-auto'} h-full`}>
        <div className={`flex items-center justify-between h-full py-3 ${isAuthPage ? 'px-6 lg:px-12' : 'px-4 sm:px-6 lg:px-[104.5px]'}`}>
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center h-10">
            {/* Logo - 41.79px x 40px */}
            <Link href="/" className="flex-shrink-0 h-10 w-[120px] relative">
              <Image 
                src="/logo.png" 
                alt="NuttyFans Logo" 
                fill 
                sizes="120px"
                className="object-contain object-left"
                priority
              />
            </Link>

            {/* Navigation Links - Hidden on mobile, shown on desktop */}
            {!isAuthPage && (
              <nav className="hidden lg:flex items-center lg:ml-[73.78px] gap-6 h-6">
                <Link 
                  href="/" 
                  className="transition-colors"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '15.1px',
                    fontWeight: 400,
                    lineHeight: '24px',
                    color: pathname === '/' ? '#101828' : '#4A5565'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#101828'}
                  onMouseLeave={(e) => e.currentTarget.style.color = pathname === '/' ? '#101828' : '#4A5565'}
                >
                  Home
                </Link>
                <Link 
                  href="/discover" 
                  className="transition-colors"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '15.1px',
                    fontWeight: 400,
                    lineHeight: '24px',
                    color: pathname === '/discover' ? '#101828' : '#4A5565'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#101828'}
                  onMouseLeave={(e) => e.currentTarget.style.color = pathname === '/discover' ? '#101828' : '#4A5565'}
                >
                  Discover
                </Link>

                <Link 
                  href="/messages" 
                  className="transition-colors relative flex items-center gap-1"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '15.1px',
                    fontWeight: 400,
                    lineHeight: '24px',
                    color: pathname === '/messages' ? '#101828' : '#4A5565'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#101828'}
                  onMouseLeave={(e) => e.currentTarget.style.color = pathname === '/messages' ? '#101828' : '#4A5565'}
                >
                  Messages
                  {totalUnreadCount > 0 && userProfile?.role === 'creator' && (
                    <span 
                      className="flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-white rounded-full"
                      style={{ backgroundColor: '#E60076' }}
                    >
                      {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                    </span>
                  )}
                </Link>
                <Link 
                  href="/subscription" 
                  className="transition-colors"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '15.1px',
                    fontWeight: 400,
                    lineHeight: '24px',
                    color: pathname === '/subscription' ? '#101828' : '#4A5565'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#101828'}
                  onMouseLeave={(e) => e.currentTarget.style.color = pathname === '/subscription' ? '#101828' : '#4A5565'}
                >
                  Subscription
                </Link>
                <Link 
                  href={userProfile?.role === 'creator' ? '/live/go-live' : '/live'}
                  className="transition-colors"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '15.1px',
                    fontWeight: 400,
                    lineHeight: '24px',
                    color: (pathname === '/live' || pathname === '/live/go-live') ? '#101828' : '#4A5565'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#101828'}
                  onMouseLeave={(e) => e.currentTarget.style.color = (pathname === '/live' || pathname === '/live/go-live') ? '#101828' : '#4A5565'}
                >
                  Live Stream
                </Link>
                <Link 
                  href="/dashboard" 
                  className="transition-colors"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '15.1px',
                    fontWeight: 400,
                    lineHeight: '24px',
                    color: pathname === '/dashboard' ? '#101828' : '#4A5565'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#101828'}
                  onMouseLeave={(e) => e.currentTarget.style.color = pathname === '/dashboard' ? '#101828' : '#4A5565'}
                >
                  Dashboard
                </Link>
          </nav>
            )}


          </div>

          {/* Right side - Auth Button */}
          {isAuthPage && (
            <div className="flex items-center">
                <Link 
                  href="/" 
                  className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-90 active:scale-95 shadow-md hover:shadow-lg transform"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    background: 'linear-gradient(135deg, rgba(243, 117, 194, 1) 0%, rgba(177, 83, 215, 1) 34%, rgba(77, 47, 178, 1) 68%, rgba(14, 33, 160, 1) 100%)',
                    color: '#FFFFFF',
                  }}
                >
                  Back to Home
                </Link>
            </div>
          )}

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
                      className="w-full rounded-full px-4 py-1.5 outline-none transition-all"
                      style={{
                        backgroundColor: '#F9FAFB',
                        border: '1px solid #E5E7EB',
                        fontSize: '14px',
                        color: '#101828',
                        fontFamily: 'Inter, sans-serif',
                        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#9810FA';
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#E5E7EB';
                        e.currentTarget.style.backgroundColor = '#F9FAFB';
                      }}
                    />
                  </div>
                  <button 
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                    style={{
                      color: isSearchOpen ? '#9810FA' : '#4A5565',
                    }}
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    onMouseEnter={(e) => {
                      if (!isSearchOpen) e.currentTarget.style.color = '#101828';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSearchOpen) e.currentTarget.style.color = '#4A5565';
                    }}
                    aria-label="Search"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Notifications Icon with Dropdown */}
              <div className="relative ml-4" ref={notificationsRef}>
                <button 
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-colors relative"
                  style={{
                    color: isNotificationsOpen ? '#9810FA' : '#4A5565',
                  }}
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  onMouseEnter={(e) => {
                    if (!isNotificationsOpen) e.currentTarget.style.color = '#101828';
                  }}
                  onMouseLeave={(e) => {
                    if (!isNotificationsOpen) e.currentTarget.style.color = '#4A5565';
                  }}
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {notificationsUnreadCount > 0 && (
                    <span 
                      className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full border-2"
                      style={{
                        backgroundColor: '#E60076',
                        borderColor: '#FFFFFF',
                      }}
                    ></span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-80 rounded-xl py-2 z-50 animate-in fade-in zoom-in duration-200"
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      boxShadow: '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -4px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <div 
                      className="px-4 py-2 flex justify-between items-center"
                      style={{ borderBottom: '1px solid #E5E7EB' }}
                    >
                      <h3 
                        className="font-bold text-sm"
                        style={{ 
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#101828'
                        }}
                      >
                        Notifications
                      </h3>
                      {notificationsUnreadCount > 0 && (
                        <button 
                          onClick={() => markAllAsRead()}
                          className="text-xs font-medium transition-colors"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '12px',
                            fontWeight: 500,
                            color: '#9810FA'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#8200DB'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#9810FA'}
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 3).map((notif) => (
                          <div 
                            key={notif.id} 
                            onClick={() => dismissNotification(notif.id)}
                            className="px-4 py-3 transition-colors cursor-pointer last:border-0 flex gap-3"
                            style={{
                              backgroundColor: !notif.isRead ? 'rgba(152, 16, 250, 0.05)' : 'transparent',
                              borderBottom: '1px solid #F9FAFB',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = !notif.isRead ? 'rgba(152, 16, 250, 0.05)' : 'transparent'}
                          >
                            <div 
                              className="w-2 h-2 mt-1.5 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor: !notif.isRead ? '#E60076' : 'transparent',
                              }}
                            ></div>
                            <div>
                               <div className="flex items-center justify-between gap-2">
                                <p 
                                  className={`leading-tight text-sm font-medium ${!notif.isRead ? 'text-gray-900' : 'text-gray-600'}`}
                                  style={{ fontFamily: 'Inter, sans-serif' }}
                                >
                                  {notif.title}
                                </p>
                                {notif.amount && (
                                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                    +${(notif.amount / 100).toFixed(2)}
                                  </span>
                                )}
                              </div>
                              <p 
                                className="mt-0.5 text-xs text-gray-500 line-clamp-2"
                                style={{ fontFamily: 'Inter, sans-serif' }}
                              >
                                {notif.message}
                              </p>
                              <p 
                                className="mt-1 text-[10px] text-gray-400"
                                style={{ fontFamily: 'Inter, sans-serif' }}
                              >
                                {notif.createdAt ? format(notif.createdAt instanceof Object && 'toDate' in notif.createdAt ? (notif.createdAt as { toDate: () => Date }).toDate() : new Date(), 'MMM dd, HH:mm') : 'Just now'}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Bell className="w-6 h-6 text-gray-300" />
                          </div>
                          <p className="text-sm text-gray-500 font-medium">No new notifications</p>
                        </div>
                      )}
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
                        <div 
                          className="w-full h-full flex items-center justify-center"
                          style={{
                            background: 'linear-gradient(135deg, rgba(243, 117, 194, 1) 0%, rgba(177, 83, 215, 1) 34%, rgba(77, 47, 178, 1) 68%, rgba(14, 33, 160, 1) 100%)',
                          }}
                        >
                          <User className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </button>

                    {/* Dropdown Menu for logged in users */}
                    {isDropdownOpen && (
                      <div 
                        className="absolute right-0 mt-2 w-48 rounded-lg py-1 z-50"
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E5E7EB',
                          boxShadow: '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -4px rgba(0, 0, 0, 0.1)',
                        }}
                      >
                        <div 
                          className="px-4 py-2"
                          style={{ borderBottom: '1px solid #E5E7EB' }}
                        >
                          <p 
                            className="text-sm font-medium truncate"
                            style={{ 
                              fontFamily: 'Inter, sans-serif',
                              fontSize: '14px',
                              fontWeight: 500,
                              color: '#101828'
                            }}
                          >
                            {user.displayName || 'User'}
                          </p>
                          <p 
                            className="text-xs font-normal truncate"
                            style={{ 
                              fontFamily: 'Inter, sans-serif',
                              fontSize: '12px',
                              fontWeight: 400,
                              color: '#4A5565'
                            }}
                          >
                            {user.email}
                          </p>
                        </div>
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 px-4 py-2 transition-colors"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14px',
                            fontWeight: 400,
                            color: '#4A5565'
                          }}
                          onClick={() => setIsDropdownOpen(false)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#F9FAFB';
                            e.currentTarget.style.color = '#101828';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#4A5565';
                          }}
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </Link>
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 px-4 py-2 transition-colors"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14px',
                            fontWeight: 400,
                            color: '#4A5565'
                          }}
                          onClick={() => setIsDropdownOpen(false)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#F9FAFB';
                            e.currentTarget.style.color = '#101828';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#4A5565';
                          }}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center gap-2 px-4 py-2 transition-colors"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14px',
                            fontWeight: 400,
                            color: '#4A5565'
                          }}
                          onClick={() => setIsDropdownOpen(false)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#F9FAFB';
                            e.currentTarget.style.color = '#101828';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#4A5565';
                          }}
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                        <div 
                          className="my-1"
                          style={{ borderTop: '1px solid #E5E7EB' }}
                        ></div>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-4 py-2 transition-colors"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14px',
                            fontWeight: 400,
                            color: '#FB2C36'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#FEF2F2';
                            e.currentTarget.style.color = '#DC2626';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#FB2C36';
                          }}
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
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-400" />
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

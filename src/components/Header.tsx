'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Bell, Search, Menu, LogOut, User, Settings, LayoutDashboard } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function Header() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/verify-otp' || pathname === '/verify-age';
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsDropdownOpen(false);
  };

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
                  href="/cart" 
                  className={`text-[15.1px] leading-6 font-normal transition-colors ${
                    pathname === '/cart' ? 'text-[#101828]' : 'text-[#4a5565] hover:text-[#101828]'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Cart
                </Link>
                <Link 
                  href="/messages" 
                  className={`text-[15.1px] leading-6 font-normal transition-colors ${
                    pathname === '/messages' ? 'text-[#101828]' : 'text-[#4a5565] hover:text-[#101828]'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Messages
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
                  href="/live" 
                  className={`text-[15.1px] leading-6 font-normal transition-colors ${
                    pathname === '/live' ? 'text-[#101828]' : 'text-[#4a5565] hover:text-[#101828]'
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
              {/* Search Icon - 36px x 36px */}
              <button 
                className="w-9 h-9 rounded-full flex items-center justify-center text-[#4a5565] hover:text-[#101828] transition-colors"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Notifications Icon with Badge - 36px x 36px, gap of 16px */}
              <button 
                className="w-9 h-9 rounded-full flex items-center justify-center text-[#4a5565] hover:text-[#101828] transition-colors relative ml-4"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#e60076] rounded-full"></span>
              </button>

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
                        <img 
                          src={user.photoURL} 
                          alt={user.displayName || 'User'} 
                          className="w-full h-full object-cover"
                        />
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

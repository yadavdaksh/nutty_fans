'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { 
  Home, 
  Search, 
  MessageSquare, 
  Video, 
  Sparkles, 
  Settings, 
  User,
  Wallet 
} from 'lucide-react';
import { query, collection, where, onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || 'All';
  const { user, userProfile } = useAuth();
  const [totalUnread, setTotalUnread] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);

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

  // Listen for Wallet Balance
  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        setWalletBalance(snap.data().walletBalance || 0);
      }
    });
    return () => unsub();
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
    { 
      href: '/wallet', 
      label: 'Wallet', 
      icon: Wallet,
      badge: `$${(walletBalance / 100).toFixed(2)}`,
      badgeColor: 'green' 
    },
  ];

  return (
    <aside 
      className="fixed left-0 top-0 w-[276px] h-screen overflow-y-auto z-40"
      style={{
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E5E7EB',
      }}
    >
      <div className="flex flex-col h-full">
        {/* Logo Area */}
        <div className="px-6 py-8 flex justify-center">
          <Link href="/" className="flex flex-col items-center">
            <div className="w-16 h-16 relative mb-2">
              <NextImage 
                src="/logo.png" 
                alt="NuttyFans Logo" 
                fill 
                sizes="64px"
                className="object-contain"
                priority
              />
            </div>
            <span 
              className="font-bold text-2xl tracking-tight"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '24px',
                fontWeight: 700,
                color: '#101828'
              }}
            >
              nuttyfans
            </span>
            <span 
              className="-mt-1 font-medium"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
                fontWeight: 500,
                color: '#4A5565'
              }}
            >
              get nutty now
            </span>
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
                  className="flex items-center justify-between py-3 px-6 w-full transition-all"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    backgroundColor: isActive 
                      ? 'transparent'
                      : 'transparent',
                    background: isActive 
                      ? 'linear-gradient(135deg, rgba(243, 117, 194, 1) 0%, rgba(177, 83, 215, 1) 34%, rgba(77, 47, 178, 1) 68%, rgba(14, 33, 160, 1) 100%)'
                      : 'transparent',
                    color: isActive ? '#FFFFFF' : '#4A5565',
                    fontWeight: isActive ? 500 : 400,
                    borderBottom: '1px solid #F9FAFB',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#F9FAFB';
                      e.currentTarget.style.color = '#101828';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#4A5565';
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Icon 
                      className="w-5 h-5"
                      style={{
                        color: isActive ? '#FFFFFF' : '#4A5565',
                      }}
                      strokeWidth={isActive ? 2.5 : 2} 
                    />
                    <span 
                      style={{
                        fontSize: '15px',
                        lineHeight: '20px',
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                  {item.badge && (
                    <span 
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{
                        backgroundColor: isActive 
                          ? '#FFFFFF' 
                          : (item.badgeColor === 'green' ? '#D1FAE5' : '#E60076'),
                        color: isActive 
                          ? '#E60076' 
                          : (item.badgeColor === 'green' ? '#00C950' : '#FFFFFF'),
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '10px',
                        fontWeight: 700,
                      }}
                    >
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
             <h3 
               className="mb-4"
               style={{
                 fontFamily: 'Inter, sans-serif',
                 fontSize: '14px',
                 fontWeight: 500,
                 color: '#6A7282'
               }}
             >
               Categories
             </h3>
             <div className="flex flex-col gap-2">
               {['All', 'Fitness', 'Music', 'Art', 'Photography', 'Gaming', 'Cooking', 'Fashion', 'Comedy'].map((cat) => {
                 const isActive = currentCategory === cat;
                 return (
                   <button
                     key={cat}
                     onClick={() => {
                        if (cat === 'All') {
                          router.push('/discover');
                        } else {
                          router.push(`/discover?category=${cat}`);
                        }
                     }}
                     className="w-full text-left px-4 py-2 rounded-lg transition-colors border"
                     style={{
                       fontFamily: 'Inter, sans-serif',
                       fontSize: '14px',
                       fontWeight: 500,
                       backgroundColor: isActive ? '#E60076' : '#FFFFFF',
                       color: isActive ? '#FFFFFF' : '#364153',
                       borderColor: isActive ? '#E60076' : '#E5E7EB',
                     }}
                     onMouseEnter={(e) => {
                       if (!isActive) {
                         e.currentTarget.style.backgroundColor = '#F9FAFB';
                       }
                     }}
                     onMouseLeave={(e) => {
                       if (!isActive) {
                         e.currentTarget.style.backgroundColor = '#FFFFFF';
                       }
                     }}
                   >
                     {cat}
                   </button>
                 );
               })}
             </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div 
          className="mt-auto"
          style={{ borderTop: '1px solid #E5E7EB' }}
        >
          <ul className="flex flex-col w-full">
            {[
              { href: '/settings', label: 'Settings', icon: Settings },
              { href: '/profile', label: 'Profile', icon: User },
            ].map((item) => {
              const Icon = item.icon;
              
              // Custom logic for Profile to avoid highlighting on others' profiles
              let isActive = false;
              if (item.href === '/profile') {
                isActive = pathname === '/profile' || (user?.uid ? pathname === `/profile/${user.uid}` : false);
              } else {
                isActive = pathname.startsWith(item.href);
              }
              
              return (
                <li key={item.href} className="w-full">
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 py-3 px-6 w-full transition-all"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      background: isActive 
                        ? 'linear-gradient(135deg, rgba(243, 117, 194, 1) 0%, rgba(177, 83, 215, 1) 34%, rgba(77, 47, 178, 1) 68%, rgba(14, 33, 160, 1) 100%)'
                        : 'transparent',
                      color: isActive ? '#FFFFFF' : '#4A5565',
                      fontWeight: isActive ? 500 : 400,
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = '#F9FAFB';
                        e.currentTarget.style.color = '#101828';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#4A5565';
                      }
                    }}
                  >
                    <Icon 
                      className="w-5 h-5"
                      style={{
                        color: isActive ? '#FFFFFF' : '#4A5565',
                      }}
                      strokeWidth={isActive ? 2.5 : 2} 
                    />
                    <span 
                      style={{
                        fontSize: '15px',
                        lineHeight: '20px',
                      }}
                    >
                      {item.label}
                    </span>
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



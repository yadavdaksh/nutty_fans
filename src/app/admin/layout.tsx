'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Loader2,
  BarChart3, 
  Users, 
  CheckCircle2, 
  Ticket, 
  ShieldAlert, 
  Settings,
  ArrowLeft,
  LogOut,
  Banknote
} from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || userProfile?.role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [user, userProfile, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-indigo-500">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  if (!user || userProfile?.role !== 'admin') {
    return null; // Don't flash unauthorized content
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-800">Super Admin Panel</h2>
          <div className="flex items-center gap-4">
             <span className="text-sm text-gray-500 font-medium tracking-wide">ENVIRONMENT: PRODUCTION</span>
             <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">A</div>
          </div>
        </header>
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function AdminSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const menuItems = [
    { label: 'Dashboard', icon: BarChart3, href: '/admin' },
    { label: 'User Management', icon: Users, href: '/admin/users' },
    { label: 'Verification Queue', icon: CheckCircle2, href: '/admin/verification' },
    { label: 'Pending Payments', icon: Banknote, href: '/admin/payments' },
    { label: 'Coupon System', icon: Ticket, href: '/admin/coupons' },
    { label: 'Content Moderation', icon: ShieldAlert, href: '/admin/content' },
    { label: 'System Settings', icon: Settings, href: '/admin/settings' },
  ];

  return (
    <aside className="w-64 h-screen bg-[#1e1e2d] text-white fixed left-0 top-0 z-20 overflow-y-auto">
      <div className="p-6 border-b border-gray-700/50">
        <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Site
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">Admin Console</h1>
        </div>
      </div>
      <nav className="p-4 mt-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                  <span className="font-medium text-[15px]">{item.label}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              onClick={async () => {
                await signOut();
                router.push('/login');
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-400 hover:bg-red-500/10 hover:text-red-500 group"
            >
              <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-500" />
              <span className="font-medium text-[15px]">Sign Out</span>
            </button>
          </li>
        </ul>
      </nav>
      <div className="absolute bottom-0 left-0 w-full p-6 border-t border-gray-700/50 bg-[#161623]">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-gray-400 font-medium">System Online</span>
        </div>
      </div>
    </aside>
  );
}

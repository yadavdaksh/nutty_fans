'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { 
  Users, 
  Star, 
  DollarSign, 
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { startOfMonth, subMonths, endOfMonth } from 'date-fns';
import { toast } from 'react-hot-toast';

interface SystemActivity {
  text: string;
  time: string;
  type: string;
  timestamp: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState([
    { label: 'Total Users', value: '0', trend: '...', icon: Users, positive: true },
    { label: 'Verified Creators', value: '0', trend: '...', icon: Star, positive: true },
    { label: 'Gross Volume', value: '$0', trend: '...', icon: DollarSign, positive: true },
    { label: 'Platform Commission', value: '$0', trend: '...', icon: TrendingUp, positive: true },
  ]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [activities, setActivities] = useState<SystemActivity[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersSnap, creatorsSnap, subsSnap, txsAllSnap, platformSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'creators')),
          getDocs(collection(db, 'subscriptions')),
          getDocs(collection(db, 'wallet_transactions')),
          getDoc(doc(db, 'platform', 'finances'))
        ]);

        const now = new Date();
        const thisMonthStart = startOfMonth(now);
        const lastMonthStart = startOfMonth(subMonths(now, 1));
        const lastMonthEnd = endOfMonth(subMonths(now, 1));

        // 1. Calculate Monthly Revenue (from subscriptions + transactions if needed)
        // For now, let's use subscription prices from subsSnap filtered by date
        const monthlyRevenue = subsSnap.docs.reduce((acc, doc) => {
          const data = doc.data();
          const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(0);
          if (createdAt >= thisMonthStart) {
            return acc + Number(data.price || 0);
          }
          return acc;
        }, 0);

        const lastMonthRevenue = subsSnap.docs.reduce((acc, doc) => {
          const data = doc.data();
          const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(0);
          if (createdAt >= lastMonthStart && createdAt <= lastMonthEnd) {
            return acc + Number(data.price || 0);
          }
          return acc;
        }, 0);

        // 2. Calculate User Growth
        const thisMonthUsers = usersSnap.docs.filter(doc => {
          const createdAt = doc.data().createdAt instanceof Timestamp ? doc.data().createdAt.toDate() : new Date(0);
          return createdAt >= thisMonthStart;
        }).length;

        const lastMonthUsers = usersSnap.docs.filter(doc => {
          const createdAt = doc.data().createdAt instanceof Timestamp ? doc.data().createdAt.toDate() : new Date(0);
          return createdAt >= lastMonthStart && createdAt <= lastMonthEnd;
        }).length;

        const userTrend = lastMonthUsers === 0 ? (thisMonthUsers > 0 ? 100 : 0) : Math.round(((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100);
        const revTrend = lastMonthRevenue === 0 ? (monthlyRevenue > 0 ? 100 : 0) : Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100);

        // 3. Pending Creators Count
        const pendingSnap = await getDocs(query(collection(db, 'users'), where('verificationStatus', '==', 'pending')));
        setPendingCount(pendingSnap.size);

        // 4. Aggregate Recent Activities (restored from previous logic)
        const recentActivities: SystemActivity[] = [];
        // ... (activities logic remains the same, but let's re-add it carefully)
        
        // Fetch recent users
        const usersRecent = usersSnap.docs
          .sort((a, b) => (b.data().createdAt?.toMillis() || 0) - (a.data().createdAt?.toMillis() || 0))
          .slice(0, 5);
          
        usersRecent.forEach(doc => {
          const data = doc.data();
          const ts = data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now();
          recentActivities.push({
            text: `New user: ${data.displayName || 'Anonymous'}`,
            time: formatDistanceToNow(ts) + ' ago',
            type: 'user',
            timestamp: ts
          });
        });

        // Fetch recent transactions
        const txRecent = txsAllSnap.docs
          .sort((a, b) => (b.data().timestamp?.toMillis() || 0) - (a.data().timestamp?.toMillis() || 0))
          .slice(0, 5);

        txRecent.forEach(doc => {
          const data = doc.data();
          const ts = data.timestamp instanceof Timestamp ? data.timestamp.toMillis() : Date.now();
          recentActivities.push({
            text: `${data.description} ($${(data.amount / 100).toFixed(2)})`,
            time: formatDistanceToNow(ts) + ' ago',
            type: 'transaction',
            timestamp: ts
          });
        });

        const sorted = recentActivities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
        setActivities(sorted);

        const platformCommission = platformSnap.exists() ? (platformSnap.data()?.walletBalance || 0) / 100 : 0;
        const grossVolume = txsAllSnap.docs.reduce((acc, doc) => {
          const data = doc.data();
          // Sum only credits to creators or tips to counts as volume
          if (data.type === 'credit' && data.metadata?.type === 'earning') {
             return acc + (data.amount || 0);
          }
          return acc;
        }, 0) / 100;

        setStats([
          { 
            label: 'Total Users', 
            value: usersSnap.size.toLocaleString(), 
            trend: `${userTrend >= 0 ? '+' : ''}${userTrend}%`, 
            icon: Users, 
            positive: userTrend >= 0 
          },
          { 
            label: 'Verified Creators', 
            value: creatorsSnap.size.toLocaleString(), 
            trend: 'Stable', 
            icon: Star, 
            positive: true 
          },
          { 
            label: 'Gross Volume', 
            value: `$${grossVolume.toLocaleString()}`, 
            trend: `${revTrend >= 0 ? '+' : ''}${revTrend}%`, 
            icon: DollarSign, 
            positive: revTrend >= 0 
          },
          { 
            label: 'Platform Commission', 
            value: `$${platformCommission.toLocaleString()}`, 
            trend: 'Real-time', 
            icon: TrendingUp, 
            positive: true 
          },
        ]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching admin stats:", error);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="font-medium animate-pulse">Gathering intelligence...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500">Welcome back, Super Admin. Here is what is happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-indigo-50 rounded-xl">
                  <Icon className="w-6 h-6 text-indigo-600" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-bold ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.positive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {stat.trend}
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              Recent System Activity
            </h3>
            <button className="text-sm text-indigo-600 font-semibold hover:underline">View All</button>
          </div>
          <div className="space-y-6">
            {activities.length === 0 ? (
              <p className="text-gray-400 text-sm italic">No recent activity found.</p>
            ) : (
              activities.map((item, i) => (
                <div key={i} className="flex items-start gap-4 animate-in slide-in-from-left duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mt-1 shrink-0 ${
                    item.type === 'user' ? 'bg-blue-50 text-blue-500' : 
                    item.type === 'transaction' ? 'bg-green-50 text-green-500' : 
                    'bg-purple-50 text-purple-500'
                  }`}>
                    {item.type === 'user' ? <Users className="w-4 h-4" /> : 
                     item.type === 'transaction' ? <DollarSign className="w-4 h-4" /> : 
                     <Star className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 font-medium ">{item.text}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      <p className="text-xs uppercase tracking-wider font-bold opacity-60">{item.time}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#1e1e2d] text-white rounded-2xl p-8 shadow-xl">
          <h3 className="text-lg font-bold mb-6">Quick Actions</h3>
          <div className="space-y-4">
             <Link href="/admin/coupons" className="block w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold transition-colors text-center">
               Create New Coupon
             </Link>
             <Link href="/admin/verification" className="block w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold transition-colors text-center relative group">
               Review Pending Creators
               {pendingCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full shadow-lg border-2 border-[#1e1e2d] animate-bounce">
                    {pendingCount}
                  </span>
               )}
             </Link>
             <Link href="/admin/payments" className="block w-full py-3 bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded-xl font-bold transition-colors border border-green-500/20 text-center">
               Review Pending Payouts
             </Link>
             <button className="w-full py-3 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-xl font-bold transition-colors border border-red-500/20">
               System Maintenance
             </button>

          </div>
          <div className="mt-8 pt-8 border-t border-gray-700/50">
            <p className="text-xs text-gray-400 leading-relaxed">
              * Actions taken here are logged for audit purposes. Please ensure you have authorization for destructive operations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Users, 
  Star, 
  DollarSign, 
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState([
    { label: 'Total Users', value: '0', trend: '...', icon: Users, positive: true },
    { label: 'Verified Creators', value: '0', trend: '...', icon: Star, positive: true },
    { label: 'Monthly Revenue', value: '$0', trend: '...', icon: DollarSign, positive: true },
    { label: 'Total Subscriptions', value: '0', trend: '...', icon: TrendingUp, positive: true },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersSnap, creatorsSnap, subsSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'creators')),
          getDocs(collection(db, 'subscriptions')),
        ]);

        const totalRevenue = subsSnap.docs.reduce((acc, doc) => acc + Number(doc.data().price || 0), 0);

        setStats([
          { label: 'Total Users', value: usersSnap.size.toLocaleString(), trend: '+0%', icon: Users, positive: true },
          { label: 'Verified Creators', value: creatorsSnap.size.toLocaleString(), trend: '+0%', icon: Star, positive: true },
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, trend: '+0%', icon: DollarSign, positive: true },
          { label: 'Active Subscriptions', value: subsSnap.size.toLocaleString(), trend: '+0%', icon: TrendingUp, positive: true },
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
            {[
              { text: 'New creator verification requested by Sarah Miller', time: '2 mins ago', type: 'verification' },
              { text: 'Unusual payout request flagged for user ID #2384', time: '15 mins ago', type: 'alert' },
              { text: 'System-wide coupon code "WELCOME10" was created', time: '1 hour ago', type: 'system' },
              { text: 'New platform record: $10k revenue in 24 hours', time: '4 hours ago', type: 'record' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2" />
                <div className="flex-1">
                  <p className="text-sm text-gray-800 font-medium">{item.text}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#1e1e2d] text-white rounded-2xl p-8 shadow-xl">
          <h3 className="text-lg font-bold mb-6">Quick Actions</h3>
          <div className="space-y-4">
             <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold transition-colors">
               Create New Coupon
             </button>
             <button className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold transition-colors">
               Review Pending Creators
             </button>
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

'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { getCreatorProfile } from '@/lib/db';
import { useEffect, useState } from 'react';
import { 
  Upload,
  Calendar,
  MessageSquare,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Users,
  Eye,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { CreatorProfile } from '@/lib/db';

export default function DashboardPage() {
  const { user, userProfile } = useAuth();
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreatorProfile = async () => {
      if (user && userProfile?.role === 'creator') {
        try {
          const profile = await getCreatorProfile(user.uid);
          setCreatorProfile(profile);
        } catch (error) {
          console.error('Error fetching creator profile:', error);
        }
      }
      setLoading(false);
    };

    fetchCreatorProfile();
  }, [user, userProfile]);

  // Mock data for analytics (replace with real data later)
  const stats = {
    totalEarnings: creatorProfile?.subscriptionTiers?.[0]?.price 
      ? (parseFloat(creatorProfile.subscriptionTiers[0].price) * (creatorProfile.subscriberCount || 0)) 
      : 12458,
    earningsGrowth: 12.5,
    subscribers: creatorProfile?.subscriberCount || 1284,
    subscriberGrowth: 8.2,
    totalViews: 45200,
    viewsGrowth: 15.3,
    engagementRate: 89,
    engagementGrowth: -2.1,
  };

  // Mock revenue data
  const revenueData = [
    { month: 'Jan', amount: 8500, progress: 70 },
    { month: 'Feb', amount: 9200, progress: 76 },
    { month: 'Mar', amount: 10100, progress: 84 },
    { month: 'Apr', amount: 11300, progress: 94 },
    { month: 'May', amount: 12458, progress: 100 },
  ];

  // Mock subscribers data
  const recentSubscribers = [
    { name: 'Emma Wilson', time: '2 hours ago', tier: 'Premium', avatar: '' },
    { name: 'James Chen', time: '5 hours ago', tier: 'Basic', avatar: '' },
    { name: 'Sofia Garcia', time: '1 day ago', tier: 'VIP', avatar: '' },
    { name: 'Michael Brown', time: '2 days ago', tier: 'Premium', avatar: '' },
  ];

  const monthlyGoal = {
    current: 12458,
    target: 15000,
    percentage: 83,
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-[calc(100vh-65px)] bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  // If user is not a creator, show basic dashboard or redirect
  if (userProfile?.role !== 'creator') {
    return (
      <ProtectedRoute>
        <div className="min-h-[calc(100vh-65px)] bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <h1 className="text-3xl font-semibold text-[#101828] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Welcome, {user?.displayName || 'User'}!
              </h1>
              <p className="text-lg font-normal text-[#4a5565] mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
                You&apos;re currently set up as a user. Become a creator to access the creator dashboard.
              </p>
              <Link
                href="/onboarding/creator"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#9810fa] to-[#e60076] text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition-opacity"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Become a Creator
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-[calc(100vh-65px)] bg-[#f9fafb]">
        <Sidebar />
        <div className={`flex-1 ${userProfile?.role === 'creator' ? '' : 'ml-[276px]'}`}>
          <div className="px-[55px] py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-[36px] leading-[40px] font-normal text-[#101828] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Creator Dashboard
                </h1>
                <p className="text-[18px] leading-[28px] font-normal text-[#4a5565]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Welcome back, {user?.displayName || 'Sarah'}! Here&apos;s your performance overview.
                </p>
              </div>
              <Link
                href="/content/upload"
                className="flex items-center gap-2 bg-gradient-to-r from-[#9810fa] to-[#e60076] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <Upload className="w-4 h-4" />
                Upload New Post
              </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Earnings */}
              <div className="bg-white border border-[#e5e7eb] rounded-[14px] p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-[#00a63e] to-[#009966] flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="w-4 h-4 text-[#00c950]" />
                    <span className="text-sm font-normal text-[#00c950]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      +{stats.earningsGrowth}%
                    </span>
                  </div>
                </div>
                <p className="text-[30px] leading-[36px] font-normal text-[#101828] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  ${stats.totalEarnings.toLocaleString()}
                </p>
                <p className="text-sm font-normal text-[#4a5565]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Total Earnings
                </p>
              </div>

              {/* Subscribers */}
              <div className="bg-white border border-[#e5e7eb] rounded-[14px] p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-[#9810fa] to-[#e60076] flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="w-4 h-4 text-[#00c950]" />
                    <span className="text-sm font-normal text-[#00c950]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      +{stats.subscriberGrowth}%
                    </span>
                  </div>
                </div>
                <p className="text-[30px] leading-[36px] font-normal text-[#101828] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {stats.subscribers.toLocaleString()}
                </p>
                <p className="text-sm font-normal text-[#4a5565]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Subscribers
                </p>
              </div>

              {/* Total Views */}
              <div className="bg-white border border-[#e5e7eb] rounded-[14px] p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-[#155dfc] to-[#0092b8] flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="w-4 h-4 text-[#00c950]" />
                    <span className="text-sm font-normal text-[#00c950]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      +{stats.viewsGrowth}%
                    </span>
                  </div>
                </div>
                <p className="text-[30px] leading-[36px] font-normal text-[#101828] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {stats.totalViews >= 1000 ? `${(stats.totalViews / 1000).toFixed(1)}K` : stats.totalViews.toLocaleString()}
                </p>
                <p className="text-sm font-normal text-[#4a5565]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Total Views
                </p>
              </div>

              {/* Engagement */}
              <div className="bg-white border border-[#e5e7eb] rounded-[14px] p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-[#f54900] to-[#e7000b] flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1">
                    <ArrowDownRight className="w-4 h-4 text-[#fb2c36]" />
                    <span className="text-sm font-normal text-[#fb2c36]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {stats.engagementGrowth}%
                    </span>
                  </div>
                </div>
                <p className="text-[30px] leading-[36px] font-normal text-[#101828] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {stats.engagementRate}%
                </p>
                <p className="text-sm font-normal text-[#4a5565]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Engagement
                </p>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Revenue Overview */}
              <div className="lg:col-span-2 bg-white border border-[#e5e7eb] rounded-[14px] p-6">
                <h2 className="text-base font-normal text-[#101828] mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Revenue Overview
                </h2>
                <div className="space-y-6">
                  {revenueData.map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-normal text-[#4a5565]" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {item.month}
                        </span>
                        <span className="text-base font-normal text-[#101828]" style={{ fontFamily: 'Inter, sans-serif' }}>
                          ${item.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 bg-[#e5e7eb] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#030213] rounded-full transition-all"
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white border border-[#e5e7eb] rounded-[14px] p-6">
                <h2 className="text-base font-normal text-[#101828] mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <Link
                    href="/content/upload"
                    className="flex items-center gap-3 p-3 rounded-lg border border-[rgba(0,0,0,0.1)] hover:border-[#9810fa] hover:bg-purple-50 transition-all"
                  >
                    <Upload className="w-4 h-4 text-[#0a0a0a]" />
                    <span className="text-sm font-semibold text-[#0a0a0a]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Upload Content
                    </span>
                  </Link>
                  <Link
                    href="/content/schedule"
                    className="flex items-center gap-3 p-3 rounded-lg border border-[rgba(0,0,0,0.1)] hover:border-[#9810fa] hover:bg-purple-50 transition-all"
                  >
                    <Calendar className="w-4 h-4 text-[#0a0a0a]" />
                    <span className="text-sm font-semibold text-[#0a0a0a]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Schedule Post
                    </span>
                  </Link>
                  <Link
                    href="/messages"
                    className="flex items-center gap-3 p-3 rounded-lg border border-[rgba(0,0,0,0.1)] hover:border-[#9810fa] hover:bg-purple-50 transition-all"
                  >
                    <MessageSquare className="w-4 h-4 text-[#0a0a0a]" />
                    <span className="text-sm font-semibold text-[#0a0a0a]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Message Subscribers
                    </span>
                  </Link>
                  <Link
                    href="/analytics"
                    className="flex items-center gap-3 p-3 rounded-lg border border-[rgba(0,0,0,0.1)] hover:border-[#9810fa] hover:bg-purple-50 transition-all"
                  >
                    <BarChart3 className="w-4 h-4 text-[#0a0a0a]" />
                    <span className="text-sm font-semibold text-[#0a0a0a]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      View Analytics
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent Subscribers */}
            <div className="bg-white border border-[#e5e7eb] rounded-[14px] p-6 mb-8">
              <h2 className="text-base font-normal text-[#101828] mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                Recent Subscribers
              </h2>
              <div className="space-y-4">
                {recentSubscribers.map((subscriber, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {subscriber.name[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-base font-normal text-[#101828]" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {subscriber.name}
                        </p>
                        <p className="text-sm font-normal text-[#4a5565]" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {subscriber.time}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      subscriber.tier === 'Premium' 
                        ? 'bg-gradient-to-r from-[#9810fa] to-[#e60076] text-white'
                        : subscriber.tier === 'VIP'
                        ? 'bg-gradient-to-r from-[#f54900] to-[#e7000b] text-white'
                        : 'bg-[#dbeafe] border border-[#bedbff] text-[#1447e6]'
                    }`} style={{ fontFamily: 'Inter, sans-serif' }}>
                      {subscriber.tier}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Goal Progress */}
            <div className="bg-white border border-[#e5e7eb] rounded-[14px] p-6">
              <h2 className="text-base font-normal text-[#101828] mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                Monthly Goal Progress
              </h2>
              <div className="flex items-center justify-between mb-4">
                <p className="text-base font-normal text-[#364153]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  ${monthlyGoal.current.toLocaleString()} of ${monthlyGoal.target.toLocaleString()} goal
                </p>
                <p className="text-base font-normal text-[#4a5565]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {monthlyGoal.percentage}%
                </p>
              </div>
              <div className="h-3 bg-[#e5e7eb] rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-[#030213] rounded-full transition-all"
                  style={{ width: `${monthlyGoal.percentage}%` }}
                ></div>
              </div>
              <p className="text-sm font-normal text-[#4a5565]" style={{ fontFamily: 'Inter, sans-serif' }}>
                You&apos;re ${(monthlyGoal.target - monthlyGoal.current).toLocaleString()} away from reaching your monthly goal! Keep up the great work! 🎉
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

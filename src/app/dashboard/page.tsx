'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { getCreatorProfile } from '@/lib/db';
import { useEffect, useState } from 'react';
import { 
  Upload,
  MessageSquare,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Users,
  Eye,
  TrendingUp,
  Loader2,
  Plus,
  Sparkles
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { CreatorProfile } from '@/lib/db';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const { user, userProfile } = useAuth();
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  
  const { subscribers, loading: subsLoading } = useSubscriptions(undefined, user?.uid);

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
      setProfileLoading(false);
    };

    fetchCreatorProfile();
  }, [user, userProfile]);

  const loading = profileLoading || subsLoading;

  // Calculate real stats
  const activeSubsCount = subscribers.length;
  const avgPrice = creatorProfile?.subscriptionTiers?.[0]?.price ? parseFloat(creatorProfile.subscriptionTiers[0].price) : 9.99;
  const estimatedMonthlyEarnings = activeSubsCount * avgPrice;

  const stats = {
    totalEarnings: estimatedMonthlyEarnings,
    earningsGrowth: 12.5, // Mock for now
    subscribers: activeSubsCount,
    subscriberGrowth: 8.2, // Mock for now
    totalViews: creatorProfile?.profileViews || 0,
    viewsGrowth: 15.3, // Mock for now
    engagementRate: 89, // Mock for now
    engagementGrowth: -2.1, // Mock for now
  };

  // Mock revenue data (can be improved later with historical tracking)
  const revenueData = [
    { month: 'Jan', amount: estimatedMonthlyEarnings * 0.7, progress: 70 },
    { month: 'Feb', amount: estimatedMonthlyEarnings * 0.8, progress: 80 },
    { month: 'Mar', amount: estimatedMonthlyEarnings * 0.9, progress: 90 },
    { month: 'Current', amount: estimatedMonthlyEarnings, progress: 100 },
  ];

  const monthlyGoal = {
    current: estimatedMonthlyEarnings,
    target: Math.max(estimatedMonthlyEarnings * 1.5, 1000),
    percentage: Math.min(Math.round((estimatedMonthlyEarnings / Math.max(estimatedMonthlyEarnings * 1.5, 1000)) * 100), 100),
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
        </div>
      </ProtectedRoute>
    );
  }

  // If user is not a creator, show basic dashboard or redirect
  if (userProfile?.role !== 'creator') {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#f9fafb] py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-gray-200 p-12 text-center shadow-sm">
              <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-purple-600" />
              </div>
              <h1 className="text-3xl font-bold text-[#101828] mb-4">
                Welcome, {user?.displayName || 'User'}!
              </h1>
              <p className="text-lg text-[#475467] mb-10">
                You&apos;re currently in Fan mode. Start your creator journey today and share your exclusive content with the world.
              </p>
              <Link
                href="/onboarding/creator"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-bold hover:shadow-lg hover:shadow-purple-500/20 transition-all"
              >
                Become a Creator
                <Plus className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-[#f9fafb]">
        <Sidebar />
        <div className="flex-1">
          <div className="px-8 py-10 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div>
                <h1 className="text-4xl font-bold text-[#101828] mb-2">
                  Creator Dashboard
                </h1>
                <p className="text-lg text-[#475467]">
                  Welcome back, {user?.displayName}! Here&apos;s how your content is performing.
                </p>
              </div>
              <Link
                href="/content"
                className="flex items-center gap-2 bg-[#101828] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
              >
                <Upload className="w-4 h-4" />
                Upload New Content
              </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {/* Total Earnings */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-lg">
                    <ArrowUpRight className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-xs font-bold text-green-600">
                      +{stats.earningsGrowth}%
                    </span>
                  </div>
                </div>
                <p className="text-3xl font-bold text-[#101828] mb-1">
                  ${stats.totalEarnings.toLocaleString()}
                </p>
                <p className="text-sm font-medium text-[#667085]">
                  Monthly Revenue
                </p>
              </div>

              {/* Subscribers */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-lg">
                    <ArrowUpRight className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-xs font-bold text-green-600">
                      +{stats.subscriberGrowth}%
                    </span>
                  </div>
                </div>
                <p className="text-3xl font-bold text-[#101828] mb-1">
                  {stats.subscribers.toLocaleString()}
                </p>
                <p className="text-sm font-medium text-[#667085]">
                  Active Subscribers
                </p>
              </div>

              {/* Total Views */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-lg">
                    <ArrowUpRight className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-xs font-bold text-green-600">
                      +{stats.viewsGrowth}%
                    </span>
                  </div>
                </div>
                <p className="text-3xl font-bold text-[#101828] mb-1">
                  {stats.totalViews >= 1000 ? `${(stats.totalViews / 1000).toFixed(1)}K` : stats.totalViews.toLocaleString()}
                </p>
                <p className="text-sm font-medium text-[#667085]">
                  Profile Views
                </p>
              </div>

              {/* Engagement */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-red-50 rounded-lg">
                    <ArrowDownRight className="w-3.5 h-3.5 text-red-600" />
                    <span className="text-xs font-bold text-red-600">
                      {stats.engagementGrowth}%
                    </span>
                  </div>
                </div>
                <p className="text-3xl font-bold text-[#101828] mb-1">
                  {stats.engagementRate}%
                </p>
                <p className="text-sm font-medium text-[#667085]">
                  Engagement Rate
                </p>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Revenue Overview */}
              <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-[#101828]">
                    Revenue History
                  </h2>
                  <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium outline-none">
                    <option>Last 6 Months</option>
                    <option>Last Year</option>
                  </select>
                </div>
                <div className="space-y-6">
                  {revenueData.map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-[#475467]">
                          {item.month}
                        </span>
                        <span className="text-base font-bold text-[#101828]">
                          ${item.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2.5 bg-gray-50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-600 rounded-full transition-all duration-1000"
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                <h2 className="text-xl font-bold text-[#101828] mb-8">
                  Quick Actions
                </h2>
                <div className="space-y-4">
                  <Link
                    href="/content"
                    className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                      <Upload className="w-5 h-5 text-gray-600 group-hover:text-purple-600" />
                    </div>
                    <span className="text-sm font-bold text-[#344054] group-hover:text-purple-700">
                      Post New Content
                    </span>
                  </Link>
                  <Link
                    href="/messages"
                    className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                      <MessageSquare className="w-5 h-5 text-gray-600 group-hover:text-purple-600" />
                    </div>
                    <span className="text-sm font-bold text-[#344054] group-hover:text-purple-700">
                      Message Fans
                    </span>
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                      <BarChart3 className="w-5 h-5 text-gray-600 group-hover:text-purple-600" />
                    </div>
                    <span className="text-sm font-bold text-[#344054] group-hover:text-purple-700">
                      Account Settings
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent Subscribers */}
            <div className="bg-white border border-gray-100 rounded-2xl p-8 mb-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-[#101828]">
                  New Subscribers
                </h2>
                <Link href="/analytics" className="text-sm font-bold text-purple-600 hover:text-purple-700">
                  View All
                </Link>
              </div>
              
              {subscribers.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-[#475467]">
                  No subscribers yet. Start posting to attract fans!
                </div>
              ) : (
                <div className="space-y-6">
                  {subscribers.slice(0, 5).map((subscriber) => (
                    <div key={subscriber.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full border-2 border-white shadow-sm overflow-hidden bg-gray-100 relative">
                          <Image 
                            src={subscriber.user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(subscriber.user.displayName)}`} 
                            alt={subscriber.user.displayName} 
                            fill
                            className="object-cover" 
                          />
                        </div>
                        <div>
                          <p className="text-base font-bold text-[#101828]">
                            {subscriber.user.displayName}
                          </p>
                          <p className="text-sm font-medium text-[#667085]">
                            {subscriber.createdAt ? formatDistanceToNow(subscriber.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                          </p>
                        </div>
                      </div>
                      <div className="px-4 py-1.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100 uppercase tracking-wider">
                        Active Fan
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Monthly Goal Progress */}
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-bold text-[#101828] mb-8">
                Monthly Revenue Goal
              </h2>
              <div className="flex items-center justify-between mb-4">
                <p className="text-lg font-bold text-[#344054]">
                  ${monthlyGoal.current.toLocaleString()} <span className="text-[#667085] font-medium text-base">of ${monthlyGoal.target.toLocaleString()} goal</span>
                </p>
                <div className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-lg relative overflow-hidden">
                  {monthlyGoal.percentage}%
                </div>
              </div>
              <div className="h-4 bg-gray-50 rounded-full overflow-hidden mb-6">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-1000"
                  style={{ width: `${monthlyGoal.percentage}%` }}
                ></div>
              </div>
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-purple-900 leading-relaxed">
                  {monthlyGoal.percentage >= 100 
                    ? "Congratulations! You've hit your monthly goal! 🎉 Ready to aim higher?" 
                    : `You're $${(monthlyGoal.target - monthlyGoal.current).toLocaleString()} away from your goal! New content usually boosts growth by 15%.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

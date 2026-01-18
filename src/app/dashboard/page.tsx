'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { getCreatorProfile, getEarningsBreakdown, getUserFeed, Post, EarningsBreakdown, createPayoutRequest } from '@/lib/db';
import { useEffect, useState } from 'react';
import { 
  Upload,
  MessageSquare,
  BarChart3,
  DollarSign,
  Users,
  Eye,
  TrendingUp,
  Loader2,
  Sparkles,
  Image as ImageIcon,
  Wallet,
  X,
  CreditCard,
  AlertCircle,
  Mail
} from 'lucide-react';
import Link from 'next/link';
import { CreatorProfile } from '@/lib/db';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { usePosts } from '@/hooks/usePosts';
import PostGrid from '@/components/PostGrid';
import { toast } from 'react-hot-toast';

export default function DashboardPage() {
  const { user, userProfile } = useAuth();
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [earningsBreakdown, setEarningsBreakdown] = useState<EarningsBreakdown | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  
  const { subscribers, loading: subsLoading } = useSubscriptions(undefined, user?.uid);
  const { posts: myPosts, loading: postsLoading } = usePosts(user?.uid);
  
  // User Feed State
  const [feedPosts, setFeedPosts] = useState<Post[]>([]);
  const [isGlobalFeed, setIsGlobalFeed] = useState(false);
  const [feedLoading, setFeedLoading] = useState(true);

  // Payout State
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    const loadFeed = async () => {
      if (user && userProfile?.role !== 'creator') {
        try {
          const { posts, isGlobal } = await getUserFeed(user.uid);
          setFeedPosts(posts);
          setIsGlobalFeed(isGlobal);
        } catch (error) {
          console.error("Failed to load feed:", error);
        } finally {
          setFeedLoading(false);
        }
      }
    };
    loadFeed();
  }, [user, userProfile]);

  useEffect(() => {
    const fetchCreatorProfile = async () => {
      if (user && userProfile?.role === 'creator') {
        try {
          const profile = await getCreatorProfile(user.uid);
          setCreatorProfile(profile);
          
          const breakdown = await getEarningsBreakdown(user.uid);
          setEarningsBreakdown(breakdown);
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

  // Use real wallet balance for earnings (converted from cents to dollars)
  const realEarnings = (userProfile?.walletBalance || 0) / 100;
  // Fallback to estimated if 0 (optional, but for now let's show real)
  const totalEarnings = realEarnings;

  // Calculate engagement rate
  const totalLikes = myPosts.reduce((acc, post) => acc + (post.likesCount || 0), 0);
  const totalComments = myPosts.reduce((acc, post) => acc + (post.commentsCount || 0), 0);
  const calculatedEngagement = activeSubsCount > 0 
    ? ((totalLikes + totalComments) / activeSubsCount) * 100 
    : 0;

  const stats = {
    totalEarnings: totalEarnings,
    earningsGrowth: 0,
    subscribers: activeSubsCount,
    subscriberGrowth: 0,
    totalViews: creatorProfile?.profileViews || 0,
    viewsGrowth: 0,
    engagementRate: calculatedEngagement.toFixed(1),
    engagementGrowth: 0,
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
        <div className="flex min-h-screen bg-[#f9fafb]">
          <Sidebar />
          <div className="flex-1">
            <div className="px-8 py-10 max-w-4xl mx-auto">
              {/* User Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-[#101828] mb-2">
                    {isGlobalFeed ? 'Explore' : 'Your Feed'}
                  </h1>
                  <p className="text-[#475467]">
                    {isGlobalFeed 
                      ? 'Discover trending content from top creators.' 
                      : 'Latest posts from creators you subscribe to.'}
                  </p>
                </div>
                 <Link
                  href="/onboarding/creator"
                  className="bg-white border border-gray-200 text-[#344054] px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Become a Creator
                </Link>
              </div>

              {/* Feed Content */}
              {feedLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
              ) : feedPosts.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                   <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Users className="w-8 h-8 text-gray-400" />
                   </div>
                   <h3 className="text-lg font-bold text-[#101828] mb-2">No posts found</h3>
                   <p className="text-[#475467] mb-6">
                     {isGlobalFeed ? "Check back later for new content." : "Subscribe to creators to see their posts here!"}
                   </p>
                   {!isGlobalFeed && (
                     <Link
                      href="/discover"
                      className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-purple-700 transition-colors"
                    >
                      Browse Creators
                    </Link>
                   )}
                </div>
              ) : (
                <>
                  {isGlobalFeed && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-4 mb-8 flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-purple-900 text-sm">You are viewing the Global Feed</h4>
                        <p className="text-purple-700 text-sm">Subscribe to creators to customize this feed with their exclusive content.</p>
                      </div>
                    </div>
                  )}
                  <PostGrid posts={feedPosts} />
                </>
              )}
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
              <div className="flex items-center gap-4">
                <Link
                  href="/content"
                  className="flex items-center gap-2 bg-[#101828] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
                >
                  <Upload className="w-4 h-4" />
                  Upload New Content
                </Link>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {/* Total Earnings */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-[#101828] mb-1">
                  ${stats.totalEarnings.toLocaleString()}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[#667085]">
                    Available Balance
                  </p>
                  <button 
                    onClick={() => setIsPayoutModalOpen(true)}
                    className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                  >
                    <Wallet className="w-3 h-3" />
                    Request
                  </button>
                </div>
              </div>

              {/* Subscribers */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
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
                    Revenue Breakdown
                  </h2>
                </div>
                
                {earningsBreakdown ? (
                  <div className="space-y-6">
                    {[
                      { label: 'Subscriptions', key: 'subscription', color: 'bg-purple-600' },
                      { label: 'Tips & Donations', key: 'tip', color: 'bg-yellow-500' },
                      { label: 'Message Unlocks', key: 'message_unlock', color: 'bg-pink-500' },
                      { label: 'Calls', key: 'call', color: 'bg-blue-500' },
                    ].map((item) => {
                      const amount = earningsBreakdown[item.key] || 0;
                      const total = earningsBreakdown.total || 1; 
                      const percentage = Math.round((amount / total) * 100);
                      
                      return (
                        <div key={item.key}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-[#475467]">
                              {item.label}
                            </span>
                            <div className="text-right">
                              <span className="text-sm font-bold text-[#101828] block">
                                ${(amount / 100).toFixed(2)}
                              </span>
                              <span className="text-xs text-gray-500 font-medium">
                                {percentage}%
                              </span>
                            </div>
                          </div>
                          <div className="h-2.5 bg-gray-50 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                )}
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
                    href="/dashboard/newsletter"
                    className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                      <Mail className="w-5 h-5 text-gray-600 group-hover:text-purple-600" />
                    </div>
                    <span className="text-sm font-bold text-[#344054] group-hover:text-purple-700">
                      Send Newsletter
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

            {/* My Posts Section */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#101828]">My Recent Posts</h2>
              </div>

              {postsLoading ? (
                <div className="text-center py-12">
                   <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
                </div>
              ) : myPosts.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                   <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                     <ImageIcon className="w-8 h-8 text-gray-400" />
                   </div>
                   <h3 className="text-lg font-bold text-[#101828] mb-2">No posts yet</h3>
                   <Link
                    href="/content"
                    className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-purple-700 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Create Post
                  </Link>
                </div>
              ) : (
                <PostGrid posts={myPosts} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payout Request Modal */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
             <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-6 text-white text-center relative">
                <button 
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                   <Wallet className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">Request a Payout</h3>
                <p className="text-white/80 text-sm">Transfer your earnings to your bank account</p>
             </div>
             
             <div className="p-8">
                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Available Balance</label>
                  <div className="text-3xl font-black text-gray-900">${realEarnings.toFixed(2)}</div>
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Payout Amount ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-600 font-bold text-lg"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 font-medium">Min payout: $10.00</p>
                </div>

                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 mb-8">
                   <div className="flex gap-3">
                      <CreditCard className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-blue-900 mb-1">Bank Details Check</p>
                        <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                          {userProfile?.bankDetails 
                            ? `Withdraw to: ${userProfile.bankDetails.bankName} (****${userProfile.bankDetails.accountNumber.slice(-4)})`
                            : "No bank details found. Please update your profile settings first."}
                        </p>
                      </div>
                   </div>
                </div>

                <button 
                  onClick={async () => {
                    const amount = parseFloat(payoutAmount);
                    if (isNaN(amount) || amount < 10) {
                      return toast.error("Minimum payout amount is $10.00");
                    }
                    if (amount > realEarnings) {
                      return toast.error("Insufficient balance");
                    }
                    if (!userProfile?.bankDetails || !userProfile.bankDetails.accountNumber) {
                      return toast.error("Please add bank details in settings first");
                    }

                    setIsRequesting(true);
                    try {
                      await createPayoutRequest(user!.uid, Math.round(amount * 100), userProfile.bankDetails);
                      toast.success("Payout request submitted successfully!");
                      setIsPayoutModalOpen(false);
                      setPayoutAmount('');
                    } catch (err: unknown) {
                      toast.error((err as Error).message || "Failed to submit payout request");
                    } finally {
                      setIsRequesting(false);
                    }
                  }}
                  disabled={isRequesting || !payoutAmount || parseFloat(payoutAmount) < 10}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                >
                  {isRequesting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Request"}
                </button>

                <div className="flex items-center gap-2 justify-center mt-6 text-gray-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Processed within 3-5 business days</span>
                </div>
             </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}

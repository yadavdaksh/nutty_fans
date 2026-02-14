'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { 
  getCreatorProfile, 
  getEarningsBreakdown, 
  getUserFeed, 
  Post, 
  EarningsBreakdown, 
  createPayoutRequest,
  getCreatorPayoutRequests,
  PayoutRequest,
  CreatorProfile 
} from '@/lib/db';
import { useEffect, useState } from 'react';
import { 
  Upload,
  MessageSquare,
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
  Settings,
  History as HistoryIcon,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { usePosts } from '@/hooks/usePosts';
import PostGrid from '@/components/PostGrid';
import toast from 'react-hot-toast';

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
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [payoutsLoading, setPayoutsLoading] = useState(true);

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

  useEffect(() => {
    const fetchPayouts = async () => {
      if (user && userProfile?.role === 'creator') {
        try {
          const requests = await getCreatorPayoutRequests(user.uid);
          setPayoutRequests(requests);
        } catch (error) {
          console.error('Error fetching payout requests:', error);
        } finally {
          setPayoutsLoading(false);
        }
      } else {
        setPayoutsLoading(false);
      }
    };
    fetchPayouts();
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
        <div 
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: '#F9FAFB' }}
        >
          <Loader2 
            className="w-10 h-10 animate-spin"
            style={{ color: '#9810FA' }}
          />
        </div>
      </ProtectedRoute>
    );
  }

  // If user is not a creator, show basic dashboard or redirect
  if (userProfile?.role !== 'creator') {
    return (
      <ProtectedRoute>
        <div 
          className="flex min-h-screen"
          style={{ backgroundColor: '#F9FAFB' }}
        >
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
                  className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    color: '#364153',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                >
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Become a Creator
                </Link>
              </div>

              {/* Feed Content */}
              {feedLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 
                    className="w-8 h-8 animate-spin"
                    style={{ color: '#9810FA' }}
                  />
                </div>
              ) : feedPosts.length === 0 ? (
                <div 
                  className="rounded-2xl p-12 text-center"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                  }}
                >
                   <div 
                     className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                     style={{ backgroundColor: '#F9FAFB' }}
                   >
                     <Users 
                       className="w-8 h-8"
                       style={{ color: '#6A7282' }}
                     />
                   </div>
                   <h3 
                     className="text-lg font-bold mb-2"
                     style={{
                       fontFamily: 'Inter, sans-serif',
                       fontSize: '18px',
                       fontWeight: 700,
                       color: '#101828'
                     }}
                   >
                     No posts found
                   </h3>
                   <p 
                     className="mb-6"
                     style={{
                       fontFamily: 'Inter, sans-serif',
                       fontSize: '14px',
                       color: '#4A5565'
                     }}
                   >
                     {isGlobalFeed ? "Check back later for new content." : "Subscribe to creators to see their posts here!"}
                   </p>
                   {!isGlobalFeed && (
                     <Link
                      href="/discover"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-colors"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, rgba(243, 117, 194, 1) 0%, rgba(177, 83, 215, 1) 34%, rgba(77, 47, 178, 1) 68%, rgba(14, 33, 160, 1) 100%)',
                        color: '#FFFFFF',
                        borderRadius: '12px',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
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
              
              {/* Left Column (2/3) */}
              <div className="lg:col-span-2">
                  <div className="bg-white border border-gray-100 rounded-2xl p-8 mb-8 shadow-sm">
                   <h2 className="text-xl font-bold text-[#101828] mb-6">Revenue Breakdown</h2>
                   {earningsBreakdown ? (
                     <div className="space-y-6">
                       {/* Subscriptions */}
                       <div>
                         <div className="flex justify-between items-end mb-2">
                           <span className="text-sm font-medium text-[#344054]">Subscriptions</span>
                           <div className="text-right">
                             <span className="text-sm font-bold text-[#101828] block">
                               ${(earningsBreakdown.subscription / 100).toFixed(2)}
                             </span>
                             <span className="text-xs text-[#667085]">
                               {earningsBreakdown.total > 0 ? ((earningsBreakdown.subscription / earningsBreakdown.total) * 100).toFixed(0) : 0}%
                             </span>
                           </div>
                         </div>
                         <div className="w-full bg-gray-100 rounded-full h-2">
                           <div 
                             className="bg-purple-600 h-2 rounded-full transition-all duration-1000"
                             style={{ width: `${earningsBreakdown.total > 0 ? (earningsBreakdown.subscription / earningsBreakdown.total) * 100 : 0}%` }}
                           ></div>
                         </div>
                       </div>
                       
                       {/* Tips */}
                       <div>
                         <div className="flex justify-between items-end mb-2">
                           <span className="text-sm font-medium text-[#344054]">Tips & Donations</span>
                           <div className="text-right">
                             <span className="text-sm font-bold text-[#101828] block">
                               ${(earningsBreakdown.tip / 100).toFixed(2)}
                             </span>
                             <span className="text-xs text-[#667085]">
                               {earningsBreakdown.total > 0 ? ((earningsBreakdown.tip / earningsBreakdown.total) * 100).toFixed(0) : 0}%
                             </span>
                           </div>
                         </div>
                         <div className="w-full bg-gray-100 rounded-full h-2">
                           <div 
                             className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                             style={{ width: `${earningsBreakdown.total > 0 ? (earningsBreakdown.tip / earningsBreakdown.total) * 100 : 0}%` }}
                           ></div>
                         </div>
                       </div>

                        {/* Unlocks */}
                        <div>
                          <div className="flex justify-between items-end mb-2">
                            <span className="text-sm font-medium text-[#344054]">Message Unlocks</span>
                            <div className="text-right">
                              <span className="text-sm font-bold text-[#101828] block">
                                ${(earningsBreakdown.message_unlock / 100).toFixed(2)}
                              </span>
                              <span className="text-xs text-[#667085]">
                                {earningsBreakdown.total > 0 ? ((earningsBreakdown.message_unlock / earningsBreakdown.total) * 100).toFixed(0) : 0}%
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full transition-all duration-1000 opacity-60"
                              style={{ width: `${earningsBreakdown.total > 0 ? (earningsBreakdown.message_unlock / earningsBreakdown.total) * 100 : 0}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Platform Fees */}
                        <div className="pt-4 border-t border-dashed border-gray-100">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-[#667085]">Platform Fees (20%)</span>
                              <div className="group relative">
                                <div className="p-0.5 rounded-full bg-gray-100 cursor-help">
                                  <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-[10px] rounded shadow-xl z-10">
                                  NuttyFans takes a 20% platform fee to cover server costs, security, and payment processing.
                                </div>
                              </div>
                            </div>
                            <span className="text-sm font-bold text-red-500">
                              -${(earningsBreakdown.platform_fee / 100 || (earningsBreakdown.total * 0.25) / 100).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Calls */}
                       <div>
                         <div className="flex justify-between items-end mb-2">
                           <span className="text-sm font-medium text-[#344054]">Calls & Video</span>
                           <div className="text-right">
                             <span className="text-sm font-bold text-[#101828] block">
                               ${((earningsBreakdown.call + earningsBreakdown.video_call) / 100).toFixed(2)}
                             </span>
                             <span className="text-xs text-[#667085]">
                               {earningsBreakdown.total > 0 ? (((earningsBreakdown.call + earningsBreakdown.video_call) / earningsBreakdown.total) * 100).toFixed(0) : 0}%
                             </span>
                           </div>
                         </div>
                         <div className="w-full bg-gray-100 rounded-full h-2">
                           <div 
                             className="bg-orange-500 h-2 rounded-full transition-all duration-1000"
                             style={{ width: `${earningsBreakdown.total > 0 ? (((earningsBreakdown.call + earningsBreakdown.video_call) / earningsBreakdown.total) * 100) : 0}%` }}
                           ></div>
                         </div>
                       </div>

                     </div>
                   ) : (
                     <div className="text-center py-8 text-gray-500">No earnings yet</div>
                   )}
                 </div>
              </div>

              {/* Right Column (1/3) */}
              <div className="space-y-8">
                
                {/* Recent Subscribers Widget */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                   <div className="flex items-center justify-between mb-6">
                     <h2 className="text-lg font-bold text-[#101828]">Recent Subscribers</h2>
                     <Link href="/dashboard/subscribers" className="text-sm font-semibold text-purple-600 hover:text-purple-700">
                       View All
                     </Link>
                   </div>
                   
                   <div className="space-y-4">
                     {subscribers.length === 0 ? (
                       <p className="text-sm text-gray-500 italic text-center py-4">No active subscribers yet.</p>
                     ) : (
                       subscribers.slice(0, 5).map((sub) => (
                         <div key={sub.id} className="flex items-center justify-between group">
                           <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden relative border border-gray-100">
                               <Image 
                                 src={sub.user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(sub.user?.displayName || 'User')}`}
                                 alt={sub.user?.displayName || 'User'}
                                 fill
                                 className="object-cover"
                               />
                             </div>
                             <div>
                               <p className="text-sm font-semibold text-[#101828] group-hover:text-purple-600 transition-colors">
                                 {sub.user?.displayName || 'Anonymous User'}
                               </p>
                               <p className="text-xs text-[#667085]">
                                 {sub.tierId} Tier • ${sub.price}
                               </p>
                             </div>
                           </div>
                           <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                             Active
                           </span>
                         </div>
                       ))
                     )}
                   </div>
                </div>

                {/* Quick Actions (Moved from below) */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-[#101828] mb-6">
                    Quick Actions
                  </h2>
                  <div className="space-y-3">
                    <Link
                      href="/content"
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                        <Upload className="w-4 h-4 text-gray-600 group-hover:text-purple-600" />
                      </div>
                      <span className="text-sm font-bold text-[#344054] group-hover:text-purple-700">
                        Post New Content
                      </span>
                    </Link>
                    <Link
                      href="/messages"
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                        <MessageSquare className="w-4 h-4 text-gray-600 group-hover:text-purple-600" />
                      </div>
                      <span className="text-sm font-bold text-[#344054] group-hover:text-purple-700">
                        Message Fans
                      </span>
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                        <Settings className="w-4 h-4 text-gray-600 group-hover:text-purple-600" />
                      </div>
                      <span className="text-sm font-bold text-[#344054] group-hover:text-purple-700">
                        Account Settings
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>


            {/* My Posts and Payout History Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
              {/* My Recent Posts (2/3) */}
              <div className="lg:col-span-2">
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

              {/* Payout History (1/3) */}
              <div>
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-[#101828]">Payout History</h2>
                    <HistoryIcon className="w-5 h-5 text-gray-400" />
                  </div>

                  {payoutsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                    </div>
                  ) : payoutRequests.length === 0 ? (
                    <p className="text-sm text-gray-500 italic text-center py-4">No payout requests yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {payoutRequests.slice(0, 5).map((req) => (
                        <div key={req.id} className="p-3 rounded-xl border border-gray-50 flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-bold text-gray-900">${(req.amount / 100).toFixed(2)}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              req.status === 'pending' ? 'bg-yellow-50 text-yellow-600' :
                              req.status === 'approved' ? 'bg-blue-50 text-blue-600' :
                              req.status === 'paid' ? 'bg-green-50 text-green-600' :
                              'bg-red-50 text-red-600'
                            }`}>
                              {req.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                              <Clock className="w-3 h-3" />
                              <span>{req.createdAt instanceof Object && 'toDate' in req.createdAt ? format((req.createdAt as { toDate: () => Date }).toDate(), 'MMM dd, yyyy') : 'Recently'}</span>
                            </div>
                            {req.notes && (
                              <button 
                                className="text-[10px] text-purple-600 font-bold hover:underline"
                                title={req.notes}
                                onClick={() => toast(req.notes as string, { icon: 'ℹ️' })}
                              >
                                View Note
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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
                       className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-600 font-bold text-lg text-[#101828]"
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

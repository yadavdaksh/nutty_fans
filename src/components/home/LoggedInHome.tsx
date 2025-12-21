'use client';

import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { 
  Bell, 
  Heart, 
  Heart as HeartIcon,
  MessageSquare,
  Image as ImageIcon, 
  Video, 
  Loader2,
  Lock,
  Check
} from 'lucide-react';
import { useFeed } from '@/hooks/useFeed';
import { useCreators } from '@/hooks/useCreators';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

import { useSubscriptions } from '@/hooks/useSubscriptions';

export default function LoggedInHome() {
  const { user, userProfile } = useAuth();
  const { posts, loading: feedLoading } = useFeed();
  const { creators, loading: creatorsLoading } = useCreators();
  const { subscriptions, loading: subsLoading } = useSubscriptions(user?.uid);

  const liveModels = creators.filter(c => c.isLive);
  const recommendedCreators = creators
    .filter(c => !subscriptions.some(s => s.creatorId === c.userId))
    .slice(0, 3);

  return (
    <div className="flex min-h-screen bg-[#fdfbfd]" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className={`flex-1 ${userProfile?.role === 'creator' ? '' : 'ml-[276px]'} p-8`}>
        <div className="max-w-6xl mx-auto flex gap-8 items-start">
        
        {/* Feed Section - Middle */}
        <div className="flex-1 min-w-0">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-[#101828] mb-1">Home</h1>
            <p className="text-[#475467]">Welcome back! Here's what's new from your favorite creators.</p>
          </div>

          {/* Live Models Strip */}
          {(liveModels.length > 0 || creatorsLoading) && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-8 flex items-center gap-4 overflow-x-auto scrollbar-hide">
              <div className="flex-shrink-0 font-bold text-[#101828] whitespace-nowrap">
                Live Models &gt;
              </div>
              {creatorsLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
              ) : (
                liveModels.map((model) => (
                  <Link href={`/profile/${model.userId}`} key={model.userId} className="flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer group">
                    <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-[#9810fa] to-[#e60076]">
                      <div className="w-full h-full rounded-full border-2 border-white overflow-hidden relative">
                        <img 
                          src={model.user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(model.user.displayName)}`} 
                          alt={model.user.displayName} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                        />
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

          {/* Feed Posts */}
          {feedLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 italic text-[#475467]">
              No posts in your feed yet. Start following creators!
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                <div className="p-4 flex justify-between items-start">
                  <Link href={`/profile/${post.creatorId}`} className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                       <img 
                        src={post.user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user.displayName)}`} 
                        alt={post.user.displayName} 
                        className="w-full h-full object-cover" 
                       />
                     </div>
                     <div>
                       <div className="flex items-center gap-1">
                        <h3 className="font-semibold text-[#101828] text-sm">{post.user.displayName}</h3>
                        <Check className="w-3.5 h-3.5 text-[#9810fa] fill-current" />
                       </div>
                       <div className="text-xs text-[#475467] flex items-center gap-1">
                         <span>@{post.user.displayName.toLowerCase().replace(/\s/g, '')}</span>
                         <span>•</span>
                         <span>{formatDistanceToNow(post.createdAt.toDate())} ago</span>
                       </div>
                     </div>
                  </Link>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${
                    post.type === 'image' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
                  }`}>
                    {post.type === 'image' ? <ImageIcon className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                    {post.type}
                  </span>
                </div>
                
                <div className="px-4 pb-3">
                  <p className="text-[#101828] text-sm whitespace-pre-line">{post.content}</p>
                </div>

                <div className="aspect-video relative bg-black overflow-hidden group">
                  {post.isLocked ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-10 transition-colors group-hover:bg-black/50">
                      <Lock className="w-12 h-12 text-white mb-3" />
                      <p className="text-white font-medium text-sm mb-4">Subscriber Only Content</p>
                      <button className="px-6 py-2 bg-gradient-to-r from-[#9810fa] to-[#e60076] text-white rounded-full text-sm font-bold shadow-lg transform hover:scale-105 transition-all">
                        Unlock Now
                      </button>
                    </div>
                  ) : null}
                  
                  {post.type === 'image' ? (
                    <img 
                      src={post.mediaURL} 
                      alt="Post content" 
                      className={`w-full h-full object-cover transition-all ${post.isLocked ? 'blur-xl grayscale' : ''}`}
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center transition-all ${post.isLocked ? 'blur-xl grayscale' : ''}`}>
                      <video src={post.mediaURL} className="w-full h-full object-cover" />
                      {!post.isLocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white text-white">
                            <div className="border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-4 flex items-center gap-6 border-t border-gray-50">
                   <button className="flex items-center gap-2 text-[#475467] hover:text-[#e60076] transition-colors text-sm font-medium">
                     <HeartIcon className="w-5 h-5" /> {post.likesCount}
                   </button>
                   <button className="flex items-center gap-2 text-[#475467] hover:text-purple-600 transition-colors text-sm font-medium">
                     <MessageSquare className="w-5 h-5" /> {post.commentsCount}
                   </button>
                </div>
              </div>
            ))
          )}

        </div>

        {/* Right Sidebar */}
        <div className="w-[280px] flex-shrink-0 space-y-6">
          
          {/* Subscriptions Widget */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
             <h3 className="font-semibold text-[#101828] mb-4 text-[15px]">My Subscriptions</h3>
             <div className="space-y-4">
               {subsLoading ? (
                 <div className="flex justify-center p-4">
                    <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                 </div>
               ) : subscriptions.length === 0 ? (
                 <p className="text-xs text-[#475467] italic">No active subscriptions.</p>
               ) : (
                 subscriptions.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                       <img 
                        src={sub.user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(sub.user.displayName)}`} 
                        alt={sub.user.displayName} 
                        className="w-full h-full object-cover" 
                       />
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="text-sm font-semibold text-[#101828] truncate">{sub.user.displayName}</p>
                       <p className="text-xs text-[#475467] truncate">
                         {sub.creator?.subscriptionTiers?.find(t => t.name.toLowerCase().includes(sub.tierId.toLowerCase()))?.name || 'Active'} • 
                         ${sub.creator?.subscriptionTiers?.find(t => t.name.toLowerCase().includes(sub.tierId.toLowerCase()))?.price || '9.99'}/mo
                       </p>
                       <p className="text-[10px] text-[#98a2b3]">Renews {new Date(sub.expiresAt.toDate()).toLocaleDateString()}</p>
                     </div>
                  </div>
                 ))
               )}
             </div>
             <Link href="/subscription" className="block w-full mt-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-[#344054] hover:bg-gray-50 transition-colors text-center">
               Manage Subscriptions
             </Link>
          </div>

          {/* Recommended Widget */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
             <h3 className="font-semibold text-[#101828] mb-4 text-[15px]">Recommended for You</h3>
             <div className="space-y-4">
               {creatorsLoading ? (
                 <div className="flex justify-center p-4">
                    <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                 </div>
               ) : (
                 recommendedCreators.map((rec, i) => (
                  <div key={rec.userId} className="flex items-center justify-between">
                    <Link href={`/profile/${rec.userId}`} className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                         <img 
                          src={rec.user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(rec.user.displayName)}`} 
                          alt={rec.user.displayName} 
                          className="w-full h-full object-cover" 
                         />
                       </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold text-[#101828] truncate">{rec.user.displayName}</p>
                          </div>
                          <p className="text-xs text-[#475467] truncate">@{rec.user.displayName.toLowerCase().replace(/\s/g, '')}</p>
                         <span className="inline-block mt-1 px-1.5 py-0.5 bg-gray-100 text-[#475467] text-[10px] rounded-full font-medium">
                          {rec.categories?.[0] || 'Creator'}
                         </span>
                       </div>
                    </Link>
                    <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-[#344054] hover:bg-gray-50">
                      Follow
                    </button>
                  </div>
                 ))
               )}
             </div>
             <Link href="/discover" className="block w-full mt-6 text-sm font-medium text-[#344054] hover:text-[#101828] text-center">
               Discover More
             </Link>
          </div>

        </div>

        </div>
      </main>
    </div>
  );
}

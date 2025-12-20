'use client';

import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { 
  Users, 
  Video,
  Loader2,
  Check,
  Play
} from 'lucide-react';
import { useCreators } from '@/hooks/useCreators';
import Link from 'next/link';

export default function LivePage() {
  const { userProfile } = useAuth();
  const { creators, loading } = useCreators();

  const liveCreators = creators.filter(c => c.isLive);

  return (
    <div className="flex min-h-screen bg-[#fdfbfd]" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Sidebar />
      
      <main className={`flex-1 ${userProfile?.role === 'creator' ? '' : 'ml-[276px]'} p-8`}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-[#101828] mb-1">Live Streams</h1>
            <p className="text-[#475467]">Watch live content from your favorite creators</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm font-medium text-[#101828] shadow-sm border border-gray-200">
              <Video className="w-4 h-4 text-red-500" />
              Live Now
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#475467] hover:bg-gray-50 rounded-lg">
              Upcoming
            </button>
          </div>

          {/* Live Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {loading ? (
               <div className="col-span-2 flex justify-center py-20">
                 <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
               </div>
             ) : liveCreators.length === 0 ? (
               <div className="col-span-2 text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <Video className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#101828] mb-1">No streams currently live</h3>
                  <p className="text-[#475467]">Check back later or explore other creators in Discover</p>
               </div>
             ) : (
               liveCreators.map((creator) => (
                 <Link 
                   key={creator.userId} 
                   href={`/profile/${creator.userId}`}
                   className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
                 >
                   {/* Thumbnail Container */}
                   <div className="relative aspect-video bg-gray-900 overflow-hidden">
                     <img 
                       src={`https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800&q=80`} 
                       alt={creator.user.displayName} 
                       className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                     />
                     
                     {/* Live Badge */}
                     <div className="absolute top-4 left-4 flex items-center gap-1 bg-[#f04438] text-white px-2 py-1 rounded text-xs font-bold uppercase tracking-wide">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        LIVE
                     </div>
   
                     {/* Viewer Count */}
                     <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs font-medium">
                       <Users className="w-3.5 h-3.5" />
                       1.2K
                     </div>
   
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/50 text-white transform scale-90 group-hover:scale-100 transition-transform">
                           <Play className="w-6 h-6 fill-current" />
                         </div>
                      </div>
                   </div>
   
                   {/* Details */}
                   <div className="p-5 flex gap-4">
                     <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                          <img 
                           src={creator.user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.user.displayName)}`} 
                           alt={creator.user.displayName} 
                           className="w-full h-full object-cover" 
                          />
                        </div>
                     </div>
                     <div className="min-w-0 flex-1">
                       <h3 className="text-base font-semibold text-[#101828] mb-1 line-clamp-1 group-hover:text-purple-600 transition-colors">
                         Join my live session! - {creator.categories?.[0] || 'Life'}
                       </h3>
                       <p className="text-xs text-[#475467] mb-3 flex items-center gap-1">
                         {creator.user.displayName} <Check className="w-3 h-3 text-[#9810fa] fill-current" />
                       </p>
                       <span className="inline-block px-2.5 py-0.5 bg-gray-50 text-[#344054] text-xs font-medium rounded-full border border-gray-200">
                          {creator.categories?.[0] || 'Creator'}
                        </span>
                     </div>
                   </div>
                 </Link>
               ))
             )}
          </div>
        </div>
      </main>
    </div>
  );
}

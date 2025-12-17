'use client';

import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { Users, Video } from 'lucide-react';

const LIVE_STREAMS = [
  {
    id: 1,
    title: 'Morning HIIT Workout - Join Live!',
    creator: 'Sarah Johnson',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    thumbnail: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800&q=80', // Workout related
    viewers: '1,284',
    category: 'Fitness',
    duration: '45 min',
    isLive: true,
  },
  {
    id: 2,
    title: 'Live Music Session - New Album Preview',
    creator: 'Marcus Chen',
    avatar: 'https://i.pravatar.cc/150?u=marcus',
    thumbnail: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?w=800&q=80', // Music related
    viewers: '892',
    category: 'Music',
    duration: '1h 15m',
    isLive: true,
  },
];

export default function LivePage() {
  const { userProfile } = useAuth();
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
              <Video className="w-4 h-4" />
              Live Now
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#475467] hover:bg-gray-50 rounded-lg">
              <span className="w-4 h-4 flex items-center justify-center">📅</span>
              Upcoming
            </button>
             <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#475467] hover:bg-gray-50 rounded-lg">
              <span className="w-4 h-4 flex items-center justify-center">▶️</span>
              Replays
            </button>
          </div>

          {/* Live Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {LIVE_STREAMS.map((stream) => (
              <div key={stream.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                {/* Thumbnail Container */}
                <div className="relative aspect-video bg-gray-900 group cursor-pointer">
                  <img src={stream.thumbnail} alt={stream.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Live Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-1 bg-[#f04438] text-white px-2 py-1 rounded text-xs font-bold uppercase tracking-wide">
                     <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                     LIVE
                  </div>

                  {/* Viewer Count */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs font-medium">
                    <Users className="w-3.5 h-3.5" />
                    {stream.viewers}
                  </div>

                   {/* Duration */}
                   <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-medium">
                    {stream.duration}
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex gap-4">
                  <div className="flex-shrink-0">
                     <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                       <img src={stream.avatar} alt={stream.creator} className="w-full h-full object-cover" />
                     </div>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#101828] mb-1 line-clamp-1">{stream.title}</h3>
                    <p className="text-xs text-[#475467] mb-3">{stream.creator}</p>
                    <span className="inline-block px-2.5 py-0.5 bg-gray-50 text-[#344054] text-xs font-medium rounded-full border border-gray-200">
                       {stream.category}
                     </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

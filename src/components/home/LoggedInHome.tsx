'use client';

import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { Bell, Heart, Link as LinkIcon, Image as ImageIcon, Video, MoreHorizontal, User } from 'lucide-react';

export default function LoggedInHome() {
  const { user, userProfile } = useAuth();

  const LIVE_MODELS = [
    { id: 1, name: 'Sarah', image: 'https://i.pravatar.cc/150?u=sarah', live: true },
    { id: 2, name: 'Jess', image: 'https://i.pravatar.cc/150?u=jess', live: true },
    { id: 3, name: 'Maya', image: 'https://i.pravatar.cc/150?u=maya', live: true },
    { id: 4, name: 'Emily', image: 'https://i.pravatar.cc/150?u=emily', live: true },
    { id: 5, name: 'Chloe', image: 'https://i.pravatar.cc/150?u=chloe', live: true },
    { id: 6, name: 'Anna', image: 'https://i.pravatar.cc/150?u=anna', live: true },
    { id: 7, name: 'Lisa', image: 'https://i.pravatar.cc/150?u=lisa', live: true },
    { id: 8, name: 'Kate', image: 'https://i.pravatar.cc/150?u=kate', live: true },
  ];

  const SUBSCRIPTIONS = [
    { name: 'Sarah Johnson', handle: '@sarahjfitness', image: 'https://i.pravatar.cc/150?u=sarah', price: '$9.99/mo', renewal: 'Jan 15, 2025' },
    { name: 'Marcus Chen', handle: '@marcusmusic', image: 'https://i.pravatar.cc/150?u=marcus', price: '$14.99/mo', renewal: 'Jan 20, 2025' },
    { name: 'Emma Rose', handle: '@emmaroseart', image: 'https://i.pravatar.cc/150?u=emma', price: '$12.99/mo', renewal: 'Jan 12, 2025' },
  ];

  const RECOMMENDED = [
    { name: 'Alex Rivera', handle: '156K followers', image: 'https://i.pravatar.cc/150?u=alex', tag: 'Fitness' },
    { name: 'Luna Star', handle: '175K followers', image: 'https://i.pravatar.cc/150?u=luna', tag: 'Music' },
    { name: 'Jake Thompson', handle: '89K followers', image: 'https://i.pravatar.cc/150?u=jake', tag: 'Photography' },
  ];

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
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-8 flex items-center gap-4 overflow-x-auto scrollbar-hide">
            <div className="flex-shrink-0 font-bold text-[#101828] whitespace-nowrap">
              Live Models &gt;
            </div>
            {LIVE_MODELS.map((model) => (
              <div key={model.id} className="flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer group">
                <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-[#9810fa] to-[#e60076]">
                  <div className="w-full h-full rounded-full border-2 border-white overflow-hidden relative">
                    <img src={model.image} alt={model.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Post Card - Example 1 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
            <div className="p-4 flex justify-between items-start">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                   <img src="https://i.pravatar.cc/150?u=sarah" alt="Creator" className="w-full h-full object-cover" />
                 </div>
                 <div>
                   <h3 className="font-semibold text-[#101828] text-sm">Sarah Johnson</h3>
                   <div className="text-xs text-[#475467] flex items-center gap-1">
                     <span>@sarahjfitness</span>
                     <span>•</span>
                     <span>2 hours ago</span>
                   </div>
                 </div>
              </div>
              <span className="bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                <ImageIcon className="w-3 h-3" /> image
              </span>
            </div>
            
            <div className="px-4 pb-3">
              <p className="text-[#101828] text-sm">New 30-day workout challenge!</p>
            </div>

            <div className="bg-gray-100 aspect-video relative">
              {/* Placeholder Content */}
              <img 
                 src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=60" 
                 alt="Workout" 
                 className="w-full h-full object-cover"
              />
            </div>

            <div className="p-4 flex items-center gap-6 border-t border-gray-50">
               <button className="flex items-center gap-2 text-[#475467] hover:text-[#e60076] transition-colors text-sm font-medium">
                 <Heart className="w-5 h-5" /> 245
               </button>
               <button className="flex items-center gap-2 text-[#475467] hover:text-purple-600 transition-colors text-sm font-medium">
                 <Bell className="w-5 h-5" /> 18
               </button>
            </div>
          </div>

          {/* Post Card - Example 2 */}
           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 flex justify-between items-start">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                   <img src="https://i.pravatar.cc/150?u=marcus" alt="Creator" className="w-full h-full object-cover" />
                 </div>
                 <div>
                   <h3 className="font-semibold text-[#101828] text-sm">Marcus Chen</h3>
                   <div className="text-xs text-[#475467] flex items-center gap-1">
                     <span>@marcusmusic</span>
                     <span>•</span>
                     <span>5 hours ago</span>
                   </div>
                 </div>
              </div>
               <span className="bg-pink-50 text-pink-600 px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                <Video className="w-3 h-3" /> video
              </span>
            </div>
            
            <div className="px-4 pb-3">
              <p className="text-[#101828] text-sm">Behind the scenes: New album recording</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 aspect-video relative flex items-center justify-center">
               <div className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white text-white cursor-pointer hover:scale-110 transition-transform">
                 <div className="border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1"></div>
               </div>
            </div>

            <div className="p-4 flex items-center gap-6 border-t border-gray-50">
               <button className="flex items-center gap-2 text-[#475467] hover:text-[#e60076] transition-colors text-sm font-medium">
                 <Heart className="w-5 h-5" /> 512
               </button>
               <button className="flex items-center gap-2 text-[#475467] hover:text-purple-600 transition-colors text-sm font-medium">
                 <Bell className="w-5 h-5" /> 34
               </button>
            </div>
          </div>

        </div>

        {/* Right Sidebar */}
        <div className="w-[280px] flex-shrink-0 space-y-6">
          
          {/* Subscriptions Widget */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
             <h3 className="font-semibold text-[#101828] mb-4 text-[15px]">My Subscriptions</h3>
             <div className="space-y-4">
               {SUBSCRIPTIONS.map((sub, i) => (
                 <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                      <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#101828] truncate">{sub.name}</p>
                      <p className="text-xs text-[#475467] truncate">Premium • {sub.price}</p>
                      <p className="text-[10px] text-[#98a2b3]">Renews {sub.renewal}</p>
                    </div>
                 </div>
               ))}
             </div>
             <button className="w-full mt-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-[#344054] hover:bg-gray-50 transition-colors">
               Manage Subscriptions
             </button>
          </div>

          {/* Recommended Widget */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
             <h3 className="font-semibold text-[#101828] mb-4 text-[15px]">Recommended for You</h3>
             <div className="space-y-4">
               {RECOMMENDED.map((rec, i) => (
                 <div key={i} className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                        <img src={rec.image} alt={rec.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#101828] truncate">{rec.name}</p>
                        <p className="text-xs text-[#475467] truncate">{rec.handle}</p>
                        <span className="inline-block mt-1 px-1.5 py-0.5 bg-gray-100 text-[#475467] text-[10px] rounded-full font-medium">{rec.tag}</span>
                      </div>
                   </div>
                   <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-[#344054] hover:bg-gray-50">
                     Follow
                   </button>
                 </div>
               ))}
             </div>
             <button className="w-full mt-6 text-sm font-medium text-[#344054] hover:text-[#101828]">
               Discover More
             </button>
          </div>

        </div>

        </div>
      </main>
    </div>
  );
}

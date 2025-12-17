'use client';

import Sidebar from '@/components/Sidebar';
import { Search, Filter, Check } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

const CREATORS = [
  { id: 1, name: 'Sarah Johnson', handle: '@sarahjfitness', followers: '128K', price: '$9.99/mo', category: 'Fitness', image: 'https://i.pravatar.cc/150?u=sarah' },
  { id: 2, name: 'Sarah Johnson', handle: '@sarahjfitness', followers: '128K', price: '$9.99/mo', category: 'Fitness', image: 'https://i.pravatar.cc/150?u=sarah' },
  { id: 3, name: 'Sarah Johnson', handle: '@sarahjfitness', followers: '128K', price: '$9.99/mo', category: 'Fitness', image: 'https://i.pravatar.cc/150?u=sarah' },
  { id: 4, name: 'Sarah Johnson', handle: '@sarahjfitness', followers: '128K', price: '$9.99/mo', category: 'Fitness', image: 'https://i.pravatar.cc/150?u=sarah' },
  { id: 5, name: 'Sarah Johnson', handle: '@sarahjfitness', followers: '128K', price: '$9.99/mo', category: 'Fitness', image: 'https://i.pravatar.cc/150?u=sarah' },
  { id: 6, name: 'Sarah Johnson', handle: '@sarahjfitness', followers: '128K', price: '$9.99/mo', category: 'Fitness', image: 'https://i.pravatar.cc/150?u=sarah' },
  { id: 7, name: 'Sarah Johnson', handle: '@sarahjfitness', followers: '128K', price: '$9.99/mo', category: 'Fitness', image: 'https://i.pravatar.cc/150?u=sarah' },
  { id: 8, name: 'Sarah Johnson', handle: '@sarahjfitness', followers: '128K', price: '$9.99/mo', category: 'Fitness', image: 'https://i.pravatar.cc/150?u=sarah' },
  { id: 9, name: 'Sarah Johnson', handle: '@sarahjfitness', followers: '128K', price: '$9.99/mo', category: 'Fitness', image: 'https://i.pravatar.cc/150?u=sarah' },
];

export default function DiscoverPage() {
  const { userProfile } = useAuth();
  return (
    <div className="flex min-h-screen bg-[#fdfbfd]" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Sidebar />
      
      <main className={`flex-1 ${userProfile?.role === 'creator' ? '' : 'ml-[276px]'} p-8`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-[#101828] mb-1">Discover Creators</h1>
            <p className="text-[#475467]">Find and support amazing creators across all categories</p>
          </div>

          {/* Search Bar */}
          <div className="mb-10 flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#667085]" />
              <input 
                type="text" 
                placeholder="Search creators..." 
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-[#101828]"
              />
            </div>
            <button className="px-6 py-3 border border-gray-200 rounded-xl flex items-center gap-2 hover:bg-gray-50 text-[#344054] font-medium bg-white">
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Creators Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {CREATORS.map((creator, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
                {/* Cover Gradient */}
                <div className="h-32 bg-gradient-to-r from-[#9810fa] to-[#e60076]"></div>
                
                <div className="px-6 pb-6 relative">
                  {/* Avatar */}
                  <div className="w-20 h-20 rounded-full border-4 border-white absolute -top-10 bg-white">
                    <img 
                      src={creator.image} 
                      alt={creator.name} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="pt-12">
                     <div className="flex items-center gap-2 mb-1">
                       <h3 className="font-semibold text-lg text-[#101828]">{creator.name}</h3>
                       <Check className="w-4 h-4 text-[#e60076]" /> 
                       {/* Note: Screenshot has check mark. Using Check icon. */}
                     </div>
                     <p className="text-sm text-[#475467] mb-3">{creator.handle}</p>
                     
                     <div className="flex items-center gap-4 text-sm text-[#344054] mb-4 font-medium">
                       <span className="flex items-center gap-1">
                         <span className="w-4 h-4 flex items-center justify-center">👥</span> 
                         {/* Using emoji as placeholder or icon if available */}
                         {creator.followers}
                       </span>
                       <span>
                         {creator.price}
                       </span>
                     </div>

                     <span className="inline-block px-3 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
                       {creator.category}
                     </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

           {/* Load More */}
           <div className="flex justify-center pb-8">
             <button className="px-8 py-3 border border-gray-200 rounded-full text-[#344054] font-medium hover:bg-gray-50 transition-colors bg-white shadow-sm">
               Load More Creators
             </button>
           </div>

        </div>
      </main>
    </div>
  );
}

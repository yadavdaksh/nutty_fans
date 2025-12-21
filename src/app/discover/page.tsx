'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, Check, Loader2, UserCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCreators } from '@/hooks/useCreators';
import { useSubscriptions } from '@/hooks/useSubscriptions';

export default function DiscoverPage() {
  const { user, userProfile } = useAuth();
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const { creators, loading, error } = useCreators();
  const { subscriptions } = useSubscriptions(user?.uid);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCreators = creators.filter(c => {
    const matchesCategory = !category || c.categories.some(cat => cat.toLowerCase() === category.toLowerCase());
    const matchesSearch = !searchQuery ||
      c.user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.user.displayName.toLowerCase().replace(/\s/g, '').includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-[#101828]"
              />
            </div>
            <button className="px-6 py-3 border border-gray-200 rounded-xl flex items-center gap-2 hover:bg-gray-50 text-[#344054] font-medium bg-white">
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-20 text-red-500">
              Error loading creators: {error}
            </div>
          )}

          {/* Creators Grid */}
          {!loading && !error && (
            <>
              {filteredCreators.length === 0 ? (
                <div className="text-center py-20 text-[#475467]">
                  {category 
                    ? `No creators found in the "${category}" category.` 
                    : "No creators found yet."}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {filteredCreators.map((creator) => (
                    <Link 
                      key={creator.userId} 
                      href={`/profile/${creator.userId}`}
                      className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group block"
                    >
                      {/* Cover Gradient */}
                      <div className="h-32 bg-gradient-to-r from-[#9810fa] to-[#e60076]"></div>
                      
                      <div className="px-6 pb-6 relative">
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-full border-4 border-white absolute -top-10 bg-white overflow-hidden">
                          <Image 
                            src={creator.user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.user.displayName)}&background=random`} 
                            alt={creator.user.displayName} 
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Content */}
                        <div className="pt-12">
                           <div className="flex items-center justify-between gap-2 mb-1">
                             <div className="flex items-center gap-2">
                               <h3 className="font-semibold text-lg text-[#101828]">{creator.user.displayName}</h3>
                               <Check className="w-4 h-4 text-[#e60076]" />
                             </div>
                             {subscriptions.some(s => s.creatorId === creator.userId) && (
                               <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-[#9810fa] rounded-full text-[11px] font-bold border border-purple-200 shadow-sm animate-in fade-in zoom-in duration-300">
                                 <UserCheck className="w-3 h-3" />
                                 Subscribed
                               </span>
                             )}
                           </div>
                           <p className="text-sm text-[#475467] mb-3">@{creator.user.displayName.toLowerCase().replace(/\s/g, '')}</p>
                           
                           <div className="flex items-center gap-4 text-sm text-[#344054] mb-4 font-medium">
                             <span className="flex items-center gap-1">
                               <span className="w-4 h-4 flex items-center justify-center">👥</span> 
                               {creator.subscriberCount >= 1000 
                                 ? `${(creator.subscriberCount / 1000).toFixed(1)}K` 
                                 : creator.subscriberCount}
                             </span>
                             <span>
                               {creator.subscriptionTiers?.[0] 
                                 ? `$${creator.subscriptionTiers[0].price}/mo` 
                                 : 'Price N/A'}
                             </span>
                           </div>

                           <div className="flex flex-wrap gap-2">
                             {creator.categories.map((cat, idx) => (
                               <span key={idx} className="inline-block px-3 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
                                 {cat}
                               </span>
                             ))}
                           </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

           {/* Load More */}
           <div className="flex justify-center pb-8">
             <button className="px-8 py-3 border border-gray-200 rounded-full text-[#344054] font-medium hover:bg-gray-50 transition-colors bg-white shadow-sm disabled:opacity-50" disabled={loading}>
               Load More Creators
             </button>
           </div>

        </div>
      </main>
    </div>
  );
}

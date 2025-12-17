'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { getCreatorProfile, CreatorProfile } from '@/lib/db';
import { useEffect, useState } from 'react';
import { 
  Check, 
  MessageSquare, 
  Heart,
  Lock
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user && userProfile?.role === 'creator') {
        const profile = await getCreatorProfile(user.uid);
        if (profile) setCreatorProfile(profile);
      }
    };
    fetchProfile();
  }, [user, userProfile]);

  const tabs = [
    { id: 'posts', label: 'Posts' },
    { id: 'videos', label: 'Videos' },
    { id: 'photos', label: 'Photos' },
  ];

  // Fallback if no real tiers found
  const defaultTiers = [
    {
      name: 'Basic',
      price: '9.99',
      benefits: ['Access to basic content', 'Monthly live Q&A'],
    },
    {
      name: 'Premium',
      price: '19.99',
      benefits: ['Everything in Basic', 'Exclusive premium content'],
    },
     {
      name: 'VIP',
      price: '49.99',
      benefits: ['Everything in Premium', '1-on-1 monthly video call'],
    },
  ];

  const tiersToDisplay = creatorProfile?.subscriptionTiers && creatorProfile.subscriptionTiers.length > 0
    ? creatorProfile.subscriptionTiers
    : defaultTiers;

  // Mock content data
  const content = [
    { id: 1, type: 'post', locked: false, likes: 245, comments: 18 },
    { id: 2, type: 'post', locked: true },
    { id: 3, type: 'post', locked: false, likes: 189, comments: 12 },
    { id: 4, type: 'post', locked: true },
    { id: 5, type: 'post', locked: false, likes: 312, comments: 25 },
    { id: 6, type: 'post', locked: true },
  ];

  return (
    <ProtectedRoute>
      <div className="flex min-h-[calc(100vh-65px)] bg-[#f9fafb]">
        <Sidebar />
        <div className={`flex-1 ${userProfile?.role === 'creator' ? '' : 'ml-[276px]'} bg-gray-50`}>
          {/* Banner */}
          <div className="relative h-[240px] bg-gradient-to-br from-[#9810fa] via-[#e60076] to-[#f54900] overflow-hidden">
            <div className="absolute inset-0 opacity-50 mix-blend-overlay">
              <div className="w-full h-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500"></div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-6 pb-8 -mt-[80px] relative z-10">
            {/* Profile Header Card */}
            <div className="bg-white/90 backdrop-blur-sm border border-[#e5e7eb] rounded-[20px] p-6 mb-8 shadow-sm">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar - overlapping top */}
                <div className="relative -mt-20 flex-shrink-0">
                  <div className="w-[160px] h-[160px] rounded-full border-[6px] border-white shadow-lg overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-5xl font-bold">
                        {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'S'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Info Section */}
                <div className="flex-1 pt-2">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-[32px] leading-[40px] font-semibold text-[#101828]" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {user?.displayName || 'Sarah Johnson'}
                        </h1>
                        <Check className="w-6 h-6 text-[#9810fa] fill-current" />
                      </div>
                      <p className="text-[18px] text-[#4a5565] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                        @sarahjfitness
                      </p>
                      <div className="flex items-center gap-6 mb-4">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-semibold text-[#101828]" style={{ fontFamily: 'Inter, sans-serif' }}>128K</span>
                          <span className="text-sm text-[#4a5565]" style={{ fontFamily: 'Inter, sans-serif' }}>Subscribers</span>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-semibold text-[#101828]" style={{ fontFamily: 'Inter, sans-serif' }}>2.5K</span>
                          <span className="text-sm text-[#4a5565]" style={{ fontFamily: 'Inter, sans-serif' }}>Posts</span>
                        </div>
                         <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#fdf2f8] text-[#e60076]" style={{ fontFamily: 'Inter, sans-serif' }}>
                          Fitness
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                       <button className="px-6 py-2.5 bg-[#d926a9] text-white text-sm font-semibold rounded-lg hover:bg-[#b01e88] transition-colors shadow-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Subscribe
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#d0d5dd] text-[#344054] text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                        <MessageSquare className="w-4 h-4" />
                        Message
                      </button>
                       <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#d0d5dd] text-[#344054] text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                         <span className="w-4 h-4 flex items-center justify-center">🚀</span>
                        Tip
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="bg-white border border-[#e5e7eb] rounded-[14px] p-6 mb-6">
              <p className="text-base leading-6 font-normal text-[#364153] whitespace-pre-line" style={{ fontFamily: 'Inter, sans-serif' }}>
                {creatorProfile?.bio || `️‍♀️ Certified personal trainer & nutrition coach\n💪 Helping you transform your body and mindset\n🎯 Custom workout plans, meal prep guides, and daily motivation\n📍 Los Angeles, CA`}
              </p>
            </div>

            {/* Subscription Tiers */}
            <div className="mb-6">
              <h2 className="text-2xl font-normal text-[#101828] mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                Subscription Tiers
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tiersToDisplay.map((tier, index) => (
                  <div
                    key={index}
                    className={`bg-white border rounded-[14px] p-6 relative border-[#e5e7eb]`}
                  >
                    <div className={`w-12 h-12 rounded-[14px] bg-gradient-to-br from-[#9810fa] to-[#e60076] flex items-center justify-center mb-4`}>
                      <span className="text-2xl">✨</span>
                    </div>
                    <h3 className="text-base font-normal text-[#101828] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {tier.name}
                    </h3>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-[30px] leading-[36px] font-normal text-[#101828]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        ${tier.price}
                      </span>
                      <span className="text-base font-normal text-[#4a5565]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        /month
                      </span>
                    </div>
                    <ul className="space-y-3 mb-6">
                      {(tier as any).benefits?.map((benefit: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-[#9810fa] flex-shrink-0 mt-0.5" />
                          <span className="text-sm font-normal text-[#364153]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {benefit}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <button
                      className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors bg-white border border-[rgba(0,0,0,0.1)] text-[#0a0a0a] hover:bg-gray-50`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      Subscribe Now
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Tabs */}
            <div className="mb-6">
              <div className="bg-[#f3f4f6] rounded-[14px] p-1 inline-flex gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-[14px] text-sm font-semibold transition-all ${
                      activeTab === tab.id
                        ? 'bg-white text-[#0a0a0a]'
                        : 'text-[#0a0a0a] hover:bg-white/50'
                    }`}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {content.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-[#e5e7eb] rounded-[14px] overflow-hidden aspect-square relative"
                >
                  {item.locked ? (
                    <>
                      <div className="absolute inset-0 blur-md bg-gradient-to-br from-purple-400 to-pink-400"></div>
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                        <Lock className="w-12 h-12 text-white mb-2" />
                        <p className="text-sm font-normal text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                          Subscribe to unlock
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-full h-full bg-gradient-to-br from-purple-200 to-pink-200"></div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <div className="flex items-center gap-4 text-white">
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span className="text-sm font-normal" style={{ fontFamily: 'Inter, sans-serif' }}>
                              {item.likes}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            <span className="text-sm font-normal" style={{ fontFamily: 'Inter, sans-serif' }}>
                              {item.comments}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}


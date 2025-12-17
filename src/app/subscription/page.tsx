'use client';

import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle } from 'lucide-react';
import Image from 'next/image';

const SUBSCRIPTIONS = [
  { 
    id: 1, 
    name: 'Sarah Johnson', 
    handle: '@sarahjfitness', 
    price: '$9.99', 
    tier: 'Premium', 
    tierColor: 'bg-[#9810fa]',
    category: 'Fitness', 
    image: 'https://i.pravatar.cc/150?u=sarah',
    renewal: 'Jan 15, 2025',
    progress: 75, // 75% through the month
    status: 'active'
  },
  { 
    id: 2, 
    name: 'Marcus Chen', 
    handle: '@marcusmusic', 
    price: '$14.99', 
    tier: 'Basic', 
    tierColor: 'bg-blue-500',
    category: 'Music', 
    image: 'https://i.pravatar.cc/150?u=marcus',
    renewal: 'Jan 20, 2025',
    progress: 45,
    status: 'active'
  },
  { 
    id: 3, 
    name: 'Emma Rose', 
    handle: '@emmaroseart', 
    price: '$12.99', 
    tier: 'VIP', 
    tierColor: 'bg-orange-500',
    category: 'Art', 
    image: 'https://i.pravatar.cc/150?u=emma',
    renewal: 'Jan 12, 2025',
    progress: 90,
    status: 'expiring',
    warning: 'Subscription expiring soon! Renews in 5 days'
  },
];

export default function SubscriptionPage() {
  const { userProfile } = useAuth();
  return (
    <div className="flex min-h-screen bg-[#fdfbfd]" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Sidebar />
      
      <main className={`flex-1 ${userProfile?.role === 'creator' ? '' : 'ml-[276px]'} p-8`}>
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-[#101828] mb-1">My Subscriptions</h1>
            <p className="text-[#475467]">Manage your creator subscriptions and billing</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            <button className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-[#101828] shadow-sm border border-gray-200">
              Active Subscriptions
            </button>
            <button className="px-4 py-2 text-sm font-medium text-[#475467] hover:bg-gray-50 rounded-lg">
              Past Subscriptions
            </button>
            <button className="px-4 py-2 text-sm font-medium text-[#475467] hover:bg-gray-50 rounded-lg">
              Billing History
            </button>
          </div>

          {/* Subscriptions List */}
          <div className="space-y-4">
            {SUBSCRIPTIONS.map((sub) => (
              <div key={sub.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden">
                       <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#101828]">{sub.name}</h3>
                      <p className="text-sm text-[#475467] mb-2">{sub.handle}</p>
                      <div className="flex gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${sub.tierColor}`}>
                          {sub.tier}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-[#344054]">
                          {sub.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-semibold text-[#101828]">{sub.price}</div>
                    <div className="text-xs text-[#475467]">per month</div>
                  </div>
                </div>

                {/* Warning Alert if Expiring */}
                {sub.status === 'expiring' && (
                  <div className="mb-6 flex items-center gap-2 p-3 bg-[#fffaeb] border border-[#fec84b] rounded-lg text-[#b54708] text-sm font-medium">
                    <AlertCircle className="w-4 h-4" />
                    {sub.warning}
                  </div>
                )}

                {/* Progress Bar & Actions */}
                <div className="flex items-end gap-6">
                   <div className="flex-1">
                      <div className="flex justify-between text-xs mb-2">
                        <span className="font-medium text-[#344054]">Renewal Date</span>
                        <span className="text-[#475467]">{sub.renewal}</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#101828] rounded-full" 
                          style={{ width: `${sub.progress}%` }}
                        ></div>
                      </div>
                   </div>
                   <div className="flex gap-3">
                     <button className="px-4 py-2 text-sm font-semibold text-[#e60076] hover:bg-pink-50 rounded-lg transition-colors">
                       Cancel
                     </button>
                     <button className="px-4 py-2 text-sm font-semibold text-[#344054] border border-gray-200 hover:bg-gray-50 rounded-lg bg-white transition-colors">
                       Manage
                     </button>
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

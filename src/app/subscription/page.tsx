'use client';

import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { 
  Loader2,
  Check,
  Calendar,
  Settings,
  ExternalLink
} from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import Link from 'next/link';
import Image from 'next/image';
import { cancelSubscription } from '@/lib/db';
import { useState } from 'react';
export default function SubscriptionPage() {
  const { user, userProfile } = useAuth();
  const { subscriptions, loading } = useSubscriptions(user?.uid);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancel = async (subId: string) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return;
    
    setCancellingId(subId);
    try {
      await cancelSubscription(subId);
      // alert('Subscription cancelled successfully');
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Failed to cancel subscription. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div 
      className="flex min-h-screen"
      style={{ 
        fontFamily: 'Inter, sans-serif',
        backgroundColor: '#F9FAFB',
      }}
    >
      <Sidebar />
      
      <main className={`flex-1 ${userProfile?.role === 'creator' ? '' : 'ml-[276px]'} p-8`}>
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-[#101828] mb-1">My Subscriptions</h1>
              <p className="text-[#475467]">Manage your creator subscriptions and billing</p>
            </div>
            <button 
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                color: '#364153',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
            >
              <Settings className="w-4 h-4" />
              Billing
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-sm font-medium text-[#475467] mb-1">Active Subscriptions</p>
              <h3 className="text-2xl font-bold text-[#101828]">{subscriptions.length}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-sm font-medium text-[#475467] mb-1">Monthly Spend</p>
              <h3 className="text-2xl font-bold text-[#101828]">
                 ${subscriptions.reduce((acc, sub) => {
                  const tiers = sub.creator?.subscriptionTiers as Array<{ name: string; price: string }>;
                  const price = tiers?.find((t) => t.name.toLowerCase() === sub.tierId?.toLowerCase())?.price || '9.99';
                  return acc + parseFloat(price);
                }, 0).toFixed(2)}
              </h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-sm font-medium text-[#475467] mb-1">Renewal Status</p>
              <h3 className="text-2xl font-bold text-[#101828]">{subscriptions.length > 0 ? 'All Active' : 'N/A'}</h3>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            <button className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-[#101828] shadow-sm border border-gray-200">
              Active Subscriptions
            </button>
            <button className="px-4 py-2 text-sm font-medium text-[#475467] hover:bg-gray-50 rounded-lg">
              History
            </button>
          </div>

          {/* Subscriptions List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 
                  className="w-8 h-8 animate-spin"
                  style={{ color: '#9810FA' }}
                />
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center text-[#475467]">
                You don&apos;t have any active subscriptions yet.
              </div>
            ) : (
              subscriptions.map((sub) => {
                const expires = sub.expiresAt instanceof Timestamp ? sub.expiresAt.toDate() : new Date();
                const tiers = sub.creator?.subscriptionTiers as Array<{ name: string; price: string }>;
                const price = tiers?.find((t) => t.name.toLowerCase() === sub.tierId?.toLowerCase())?.price || '9.99';

                return (
                  <div key={sub.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:border-purple-200 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      {/* Creator Info */}
                      <div className="flex items-center gap-4 min-w-[240px]">
                        <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden relative">
                          <Image 
                            src={sub.creator?.coverImageURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(sub.user?.displayName || 'C')}`} 
                            alt={sub.user?.displayName || 'Creator'} 
                            fill
                            className="object-cover" 
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#101828] flex items-center gap-1">
                            {sub.user?.displayName || 'Unknown Creator'} <Check className="w-4 h-4 text-[#9810fa] fill-current" />
                          </h3>
                          <p className="text-sm text-[#475467]">@{sub.user?.displayName?.toLowerCase().replace(/\s/g, '') || 'unknown'}</p>
                        </div>
                      </div>

                      {/* Tier Info */}
                      <div className="flex-1">
                        <div className="flex justify-between items-end mb-2">
                          <div>
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1 ${
                              sub.status === 'cancelled' ? 'bg-orange-50 text-orange-700' : 'bg-purple-50 text-purple-700'
                            }`}>
                              {sub.status === 'cancelled' ? 'Ending Soon' : (sub.tierId || 'Basic')}
                            </span>
                            <p className="text-xl font-bold text-[#101828] text-sm">
                              ${price}
                              <span className="text-sm font-normal text-[#475467]">/mo</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium text-[#475467] mb-1">
                              {sub.status === 'cancelled' ? 'Expires on' : 'Renewal Date'}
                            </p>
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-[#101828]">
                              <Calendar className="w-4 h-4 text-[#475467]" />
                              {expires.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        {/* Progress Bar Mockup */}
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#9810fa] to-[#e60076]" style={{ width: '75%' }}></div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex md:flex-col gap-2">
                        <Link href={`/profile/${sub.creatorId}`} className="flex-1 px-4 py-2 bg-[#101828] text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                          View
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button 
                          onClick={() => handleCancel(sub.id)}
                          disabled={cancellingId === sub.id || sub.status === 'cancelled'}
                          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center p-2"
                        >
                          {cancellingId === sub.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : sub.status === 'cancelled' ? (
                            'Cancelled'
                          ) : (
                            'Cancel'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

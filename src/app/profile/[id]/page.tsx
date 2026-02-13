'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  CreatorProfile, 
  getUserProfile, 
  UserProfile, 
  createSubscription,
  Subscription,
  incrementProfileView
} from '@/lib/db';
import { 
  startConversation, 
  checkConversationExists 
} from '@/lib/messaging';
import { usePosts } from '@/hooks/usePosts';
import { useEffect, useState } from 'react';
import { 
  Check, 
  MessageSquare, 
  Heart,
  Lock,
  Loader2
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import CheckoutModal from '@/components/CheckoutModal';
import TipModal from '@/components/TipModal';
import WatermarkMedia from '@/components/WatermarkMedia';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const params = useParams();
  const creatorUid = params.id as string;
  const isOwnProfile = user?.uid === creatorUid;

  const [activeTab, setActiveTab] = useState('posts');
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [targetUser, setTargetUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null);
  const isSubscribed = !!activeSubscription;
  const [isSubscribing, setIsSubscribing] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<CreatorProfile['subscriptionTiers'][number] | null>(null);
  const [isTipOpen, setIsTipOpen] = useState(false);

  const { posts, loading: postsLoading } = usePosts(creatorUid);

  useEffect(() => {
    if (!creatorUid) return;

    // 1. Fetch static user profile
    getUserProfile(creatorUid).then(setTargetUser);

    // 2. Subscribe to creator profile for real-time stats
    const creatorRef = doc(db, 'creators', creatorUid);
    const unsubCreator = onSnapshot(creatorRef, (snap) => {
      if (snap.exists()) {
        setCreatorProfile(snap.data() as CreatorProfile);
      }
      setLoading(false);
    });

    // 2.5 Increment view count (only if not own profile)
    if (user && user.uid !== creatorUid) {
       // Simple implementation: increment on every visit
       // In production, we'd use a session or cookie check to prevent spam
       incrementProfileView(creatorUid).catch(console.error);
    }

    // 3. Subscribe to subscription status
    let unsubSub = () => {};
    if (user) {
      const subRef = doc(db, 'subscriptions', `${user.uid}_${creatorUid}`);
      unsubSub = onSnapshot(subRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Subscription;
          // Local check for expiry
          const isValid = data.status === 'active' && data.expiresAt.toDate() > new Date();
          setActiveSubscription(isValid ? data : null);
        } else {
          setActiveSubscription(null);
        }
      });
    }

    return () => {
      unsubCreator();
      unsubSub();
    };
  }, [creatorUid, user]);

  const handleSubscribe = async (tier: CreatorProfile['subscriptionTiers'][number]) => {
    if (!user || userProfile?.role !== 'user') {
      alert("Only fans can subscribe to creators.");
      return;
    }

    if (activeSubscription?.tierId === tier.name) {
      alert("You are already subscribed to this tier.");
      return;
    }

    setSelectedTier(tier);
    setIsCheckoutOpen(true);
  };

  const handleConfirmSubscription = async (finalPrice: string, couponCode?: string, subscriptionId?: string) => {
    if (!user || !selectedTier) return;
    
    setIsSubscribing(selectedTier.name);
    try {
      await createSubscription(user.uid, creatorUid, selectedTier.name, finalPrice, couponCode, subscriptionId);
      console.log("SquaresubscriptionId for Webhook Testing:", subscriptionId); // Helpful log for local testing
      toast.success(`Successfully subscribed to ${selectedTier.name}!`, {
        duration: 5000,
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    } catch (error) {
      console.error("Error subscribing:", error);
      throw error;
    } finally {
      setIsSubscribing(null);
    }
  };

  const scrollToTiers = () => {
    const element = document.getElementById('subscription-tiers');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleMessageClick = async () => {
    if (!user || !userProfile || !targetUser) return;
    
    // Rule: Only users (subscribers) can initiate chats with creators
    if (userProfile.role !== 'user') {
      alert("Only subscribers can initiate messages with creators.");
      return;
    }

    setIsStartingChat(true);
    try {
      // 1. Check if conversation already exists
      const existingConv = await checkConversationExists(user.uid, creatorUid);
      let convId;

      if (existingConv) {
        convId = existingConv.id;
      } else {
        // 2. Start a new conversation
        convId = await startConversation(
          user.uid,
          userProfile.displayName,
          user.photoURL || undefined,
          creatorUid,
          targetUser.displayName,
          targetUser.photoURL || undefined
        );
      }

      // 3. Redirect to messages page with the active chat selected
      router.push(`/messages?chatId=${convId}`);
      
    } catch (error) {
      console.error("Error starting conversation:", error);
      alert("Failed to start conversation. Please try again.");
    } finally {
      setIsStartingChat(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!targetUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">User not found</h2>
        <button onClick={() => router.back()} className="text-purple-600 hover:underline">Go Back</button>
      </div>
    );
  }

  const tabs = [
    { id: 'posts', label: 'Posts' },
    { id: 'videos', label: 'Videos' },
    { id: 'photos', label: 'Photos' },
  ];

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
                {/* Avatar */}
                <div className="relative -mt-20 flex-shrink-0">
                  <div className="w-[160px] h-[160px] rounded-full border-[6px] border-white shadow-lg overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                    {targetUser.photoURL ? (
                      <Image 
                        src={targetUser.photoURL} 
                        alt={targetUser.displayName} 
                        fill 
                        className="object-cover" 
                      />
                    ) : (
                      <span className="text-white text-5xl font-bold">
                        {targetUser.displayName[0]?.toUpperCase() || 'S'}
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
                          {targetUser.displayName}
                        </h1>
                        {creatorProfile && <Check className="w-6 h-6 text-[#9810fa] fill-current" />}
                      </div>
                      <p className="text-[18px] text-[#4a5565] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                        @{targetUser.displayName.toLowerCase().replace(/\s/g, '')}
                      </p>
                      <div className="flex items-center gap-6 mb-4">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-semibold text-[#101828]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {creatorProfile?.subscriberCount !== undefined && creatorProfile.subscriberCount >= 1000 
                              ? `${(creatorProfile.subscriberCount / 1000).toFixed(1)}K` 
                              : (creatorProfile?.subscriberCount || 0)}
                          </span>
                          <span className="text-sm text-[#4a5565]" style={{ fontFamily: 'Inter, sans-serif' }}>Subscribers</span>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-semibold text-[#101828]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {posts.length >= 1000 ? `${(posts.length / 1000).toFixed(1)}K` : posts.length}
                          </span>
                          <span className="text-sm text-[#4a5565]" style={{ fontFamily: 'Inter, sans-serif' }}>Posts</span>
                        </div>
                         {creatorProfile?.categories?.[0] && (
                           <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#fdf2f8] text-[#e60076]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {creatorProfile.categories[0]}
                          </span>
                         )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      {isOwnProfile ? (
                        <>
                          <Link
                            href="/settings"
                            className="px-6 py-2.5 bg-white border border-[#d0d5dd] text-[#344054] text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            Edit Profile
                          </Link>
                          {targetUser.role === 'creator' && (
                            <Link
                              href="/dashboard"
                              className="flex items-center gap-2 px-6 py-2.5 bg-[#ad46ff] text-white text-sm font-semibold rounded-lg hover:bg-[#9235e6] transition-colors shadow-sm"
                              style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                              Add Post
                            </Link>
                          )}
                        </>
                      ) : (
                        <>
                          {targetUser.role === 'creator' && (
                            <button 
                              onClick={scrollToTiers}
                              className={`px-6 py-2.5 ${isSubscribed ? 'bg-green-600' : 'bg-[#d926a9] hover:bg-[#b01e88]'} text-white text-sm font-semibold rounded-lg transition-colors shadow-sm`} 
                              style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                              {isSubscribed ? 'Subscribed' : 'Subscribe'}
                            </button>
                          )}
                          <button 
                            onClick={handleMessageClick}
                            disabled={isStartingChat}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#d0d5dd] text-[#344054] text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            {isStartingChat ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                            Message
                          </button>
                          {targetUser.role === 'creator' && (
                            <button 
                              onClick={() => setIsTipOpen(true)}
                              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#d0d5dd] text-[#344054] text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm" 
                              style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                              <span className="w-4 h-4 flex items-center justify-center">🚀</span>
                              Tip
                            </button>
                          )}
                        </>
                      )}
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

            {/* Subscription Tiers - Only for Creators */}
            {targetUser.role === 'creator' && (
              <div className="mb-6" id="subscription-tiers">
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
                        {tier.benefits?.map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-[#9810fa] flex-shrink-0 mt-0.5" />
                            <span className="text-sm font-normal text-[#364153]" style={{ fontFamily: 'Inter, sans-serif' }}>
                              {benefit}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {(() => {
                        const activeTierIndex = tiersToDisplay.findIndex(t => t.name === activeSubscription?.tierId);
                        const currentTierIndex = index;
                        
                        const isActiveTier = activeSubscription?.tierId === tier.name;
                        const currentPrice = parseFloat(activeSubscription?.price || '0');
                        const tierPrice = parseFloat(tier.price);
                        
                        // Logic: Upgrade if price is higher OR (price is same but index is higher)
                        const isUpgrade = !isActiveTier && isSubscribed && (
                          tierPrice > currentPrice || 
                          (tierPrice === currentPrice && currentTierIndex > activeTierIndex)
                        );
                        
                        // Logic: Lower if price is lower OR (price is same but index is lower)
                        const isLower = !isActiveTier && isSubscribed && (
                          tierPrice < currentPrice || 
                          (tierPrice === currentPrice && currentTierIndex < activeTierIndex)
                        );

                        return (
                          <button
                            onClick={() => !isActiveTier && !isLower && handleSubscribe(tier)}
                            disabled={!!isSubscribing || isActiveTier || (isLower && !isUpgrade)}
                            className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
                              isActiveTier 
                                ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                                : isUpgrade
                                ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm'
                                : isLower
                                ? 'bg-gray-50 text-gray-400 border border-gray-100 cursor-not-allowed opacity-50'
                                : 'bg-white border border-[rgba(0,0,0,0.1)] text-[#0a0a0a] hover:bg-gray-50 disabled:opacity-50'
                            }`}
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            {isSubscribing === tier.name ? (
                              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                            ) : isActiveTier ? (
                              'Current Tier'
                            ) : isUpgrade ? (
                              'Upgrade Now'
                            ) : isLower ? (
                              'Subscribed'
                            ) : (
                              'Subscribe Now'
                            )}
                          </button>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content Section - Only for Creators (for now) or Users if they have content */}
            {targetUser.role === 'creator' && (
              <>
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
                {postsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                  </div>
                ) : posts.length === 0 ? (
                  <div className="bg-white border border-[#e5e7eb] rounded-[14px] p-12 text-center text-[#4a5565]">
                    No posts found for this creator.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {posts.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white border border-[#e5e7eb] rounded-[14px] overflow-hidden aspect-square relative"
                      >
                        {item.isLocked && !isOwnProfile && !isSubscribed ? (
                          <>
                            <div className="absolute inset-0 blur-md bg-gradient-to-br from-purple-400 to-pink-400"></div>
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-4 text-center">
                              <Lock className="w-12 h-12 text-white mb-2" />
                              <p className="text-sm font-normal text-white mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                                Subscribe to unlock this {item.type}
                              </p>
                              <div className="flex items-center gap-4 text-white/80">
                                <div className="flex items-center gap-1">
                                  <Heart className="w-4 h-4" />
                                  <span className="text-xs">{item.likesCount}</span>
                                </div>

                              </div>
                            </div>
                          </>
                        ) : (
                          <WatermarkMedia
                            src={item.mediaURL}
                            type={item.type as 'image' | 'video'}
                            alt="Post content"
                            className="w-full h-full"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {targetUser.role === 'user' && (
               <div className="bg-white border border-[#e5e7eb] rounded-[14px] p-12 text-center">
                 <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Lock className="w-8 h-8 text-gray-400" />
                 </div>
                 <h3 className="text-lg font-semibold text-[#101828] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                   This is a user profile
                 </h3>
                 <p className="text-[#4a5565] max-w-sm mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
                   User profiles are private. Only creators have public content pages with subscription tiers.
                 </p>
               </div>
            )}
          </div>
        </div>
      </div>
      {selectedTier && (
        <CheckoutModal 
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          tier={selectedTier}
          creatorName={targetUser?.displayName || 'Creator'}
          creatorId={creatorUid}
          onConfirm={handleConfirmSubscription}
        />
      )}
      <TipModal
        isOpen={isTipOpen}
        onClose={() => setIsTipOpen(false)}
        creatorName={targetUser?.displayName || 'Creator'}
        creatorId={creatorUid}
        userId={user?.uid || ''}
      />
    </ProtectedRoute>
  );
}


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
        <button 
          onClick={() => router.back()} 
          className="hover:underline transition-colors"
          style={{ color: '#9810FA' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#8200DB'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#9810FA'}
        >
          Go Back
        </button>
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
      <div 
        className="flex min-h-[calc(100vh-65px)]"
        style={{ backgroundColor: '#F9FAFB' }}
      >
        <Sidebar />
        <div 
          className={`flex-1 ${userProfile?.role === 'creator' ? '' : 'ml-[276px]'}`}
          style={{ backgroundColor: '#F9FAFB' }}
        >
          {/* Banner */}
          <div 
            className="relative h-[240px] overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(243, 117, 194, 1) 0%, rgba(177, 83, 215, 1) 34%, rgba(77, 47, 178, 1) 68%, rgba(14, 33, 160, 1) 100%)',
            }}
          >
            <div 
              className="absolute inset-0 opacity-50 mix-blend-overlay"
              style={{
                background: 'linear-gradient(135deg, rgba(243, 117, 194, 1) 0%, rgba(177, 83, 215, 1) 34%, rgba(77, 47, 178, 1) 68%, rgba(14, 33, 160, 1) 100%)',
              }}
            ></div>
          </div>

          <div className="max-w-6xl mx-auto px-6 pb-8 -mt-[80px] relative z-10">
            {/* Profile Header Card */}
            <div 
              className="rounded-[20px] p-6 mb-8"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(24px)',
                border: '1px solid #E5E7EB',
                borderRadius: '20px',
                boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar */}
                <div className="relative -mt-20 flex-shrink-0">
                  <div 
                    className="w-[160px] h-[160px] rounded-full border-[6px] border-white shadow-lg overflow-hidden flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(243, 117, 194, 1) 0%, rgba(177, 83, 215, 1) 34%, rgba(77, 47, 178, 1) 68%, rgba(14, 33, 160, 1) 100%)',
                      boxShadow: '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -4px rgba(0, 0, 0, 0.1)',
                    }}
                  >
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
                        {creatorProfile && (
                          <Check 
                            className="w-6 h-6 fill-current"
                            style={{ color: '#9810FA' }}
                          />
                        )}
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
                           <span 
                             className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                             style={{ 
                               fontFamily: 'Inter, sans-serif',
                               fontSize: '12px',
                               fontWeight: 600,
                               backgroundColor: '#FDF2F8',
                               color: '#E60076',
                             }}
                           >
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
                            className="px-6 py-2.5 rounded-lg transition-colors shadow-sm"
                            style={{ 
                              fontFamily: 'Inter, sans-serif',
                              fontSize: '14px',
                              fontWeight: 600,
                              backgroundColor: '#FFFFFF',
                              border: '1px solid #D1D5DC',
                              color: '#364153',
                              boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                          >
                            Edit Profile
                          </Link>
                          {targetUser.role === 'creator' && (
                            <Link
                              href="/dashboard"
                              className="flex items-center gap-2 px-6 py-2.5 rounded-lg transition-colors shadow-sm"
                              style={{ 
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '14px',
                                fontWeight: 600,
                                background: 'linear-gradient(90deg, rgba(166, 195, 255, 1) 0%, rgba(134, 93, 255, 1) 100%)',
                                color: '#FFFFFF',
                                boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
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
                              className="px-6 py-2.5 rounded-lg transition-colors shadow-sm"
                              style={{ 
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '14px',
                                fontWeight: 600,
                                backgroundColor: isSubscribed ? '#00C950' : '#E60076',
                                color: '#FFFFFF',
                                boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                              }}
                              onMouseEnter={(e) => {
                                if (!isSubscribed) e.currentTarget.style.backgroundColor = '#B01E88';
                              }}
                              onMouseLeave={(e) => {
                                if (!isSubscribed) e.currentTarget.style.backgroundColor = '#E60076';
                              }}
                            >
                              {isSubscribed ? 'Subscribed' : 'Subscribe'}
                            </button>
                          )}
                          <button 
                            onClick={handleMessageClick}
                            disabled={isStartingChat}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                            style={{ 
                              fontFamily: 'Inter, sans-serif',
                              fontSize: '14px',
                              fontWeight: 600,
                              backgroundColor: '#FFFFFF',
                              border: '1px solid #D1D5DC',
                              color: '#364153',
                              boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                            }}
                            onMouseEnter={(e) => {
                              if (!isStartingChat) e.currentTarget.style.backgroundColor = '#F9FAFB';
                            }}
                            onMouseLeave={(e) => {
                              if (!isStartingChat) e.currentTarget.style.backgroundColor = '#FFFFFF';
                            }}
                          >
                            {isStartingChat ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                            Message
                          </button>
                          {targetUser.role === 'creator' && (
                            <button 
                              onClick={() => setIsTipOpen(true)}
                              className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors shadow-sm"
                              style={{ 
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '14px',
                                fontWeight: 600,
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #D1D5DC',
                                color: '#364153',
                                boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
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
            <div 
              className="rounded-[14px] p-6 mb-6"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '14px',
              }}
            >
              <p 
                className="whitespace-pre-line"
                style={{ 
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '16px',
                  fontWeight: 400,
                  lineHeight: '24px',
                  color: '#364153'
                }}
              >
                {creatorProfile?.bio || `️‍♀️ Certified personal trainer & nutrition coach\n💪 Helping you transform your body and mindset\n🎯 Custom workout plans, meal prep guides, and daily motivation\n📍 Los Angeles, CA`}
              </p>
            </div>

            {/* Subscription Tiers - Only for Creators */}
            {targetUser.role === 'creator' && (
              <div className="mb-6" id="subscription-tiers">
                <h2 
                  className="mb-6"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '24px',
                    fontWeight: 400,
                    lineHeight: '32px',
                    color: '#101828'
                  }}
                >
                  Subscription Tiers
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {tiersToDisplay.map((tier, index) => {
                    // Determine tier type based on index or name
                    const isPremium = tier.name.toLowerCase() === 'premium' || index === 1;
                    const isBasic = tier.name.toLowerCase() === 'basic' || index === 0;
                    
                    // Icon gradient based on tier
                    let iconGradient = '';
                    if (isBasic) {
                      iconGradient = 'linear-gradient(135deg, rgba(21, 93, 252, 1) 0%, rgba(0, 146, 184, 1) 100%)';
                    } else if (isPremium) {
                      iconGradient = 'linear-gradient(135deg, rgba(165, 193, 255, 1) 0%, rgba(134, 94, 254, 1) 100%)';
                    } else {
                      iconGradient = 'linear-gradient(135deg, rgba(245, 73, 0, 1) 0%, rgba(231, 0, 11, 1) 100%)';
                    }
                    
                    return (
                    <div
                      key={index}
                      className="rounded-[14px] p-6 relative"
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: isPremium ? '2px solid #9810FA' : '1px solid #E5E7EB',
                        borderRadius: '14px',
                      }}
                    >
                      {/* POPULAR Badge for Premium */}
                      {isPremium && (
                        <div 
                          className="absolute top-0 right-0"
                          style={{
                            background: 'linear-gradient(90deg, rgba(166, 195, 255, 1) 0%, rgba(134, 93, 255, 1) 100%)',
                            borderRadius: '0px 14px 0px 10px',
                            padding: '4px 12px',
                          }}
                        >
                          <span 
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontSize: '12px',
                              fontWeight: 400,
                              lineHeight: '16px',
                              color: '#FFFFFF',
                            }}
                          >
                            POPULAR
                          </span>
                        </div>
                      )}
                      
                      {/* Icon */}
                      <div 
                        className="w-12 h-12 rounded-[14px] flex items-center justify-center mb-4"
                        style={{
                          background: iconGradient,
                        }}
                      >
                        <span 
                          style={{
                            fontFamily: 'Segoe UI Emoji',
                            fontSize: '24px',
                            fontWeight: 400,
                            lineHeight: '32px',
                          }}
                        >
                          ✨
                        </span>
                      </div>
                      
                      {/* Tier Name */}
                      <h3 
                        className="mb-2"
                        style={{ 
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '16px',
                          fontWeight: 400,
                          lineHeight: '16px',
                          color: '#101828'
                        }}
                      >
                        {tier.name}
                      </h3>
                      
                      {/* Price */}
                      <div className="flex items-baseline gap-2 mb-4">
                        <span 
                          style={{ 
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '30px',
                            fontWeight: 400,
                            lineHeight: '36px',
                            color: '#101828'
                          }}
                        >
                          ${tier.price}
                        </span>
                        <span 
                          style={{ 
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '16px',
                            fontWeight: 400,
                            color: '#4A5565'
                          }}
                        >
                          /month
                        </span>
                      </div>
                      
                      {/* Benefits List */}
                      <ul className="space-y-3 mb-6">
                        {tier.benefits?.map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check 
                              className="w-5 h-5 flex-shrink-0 mt-0.5"
                              style={{ color: '#00C950' }}
                              strokeWidth={1.67}
                            />
                            <span 
                              style={{ 
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '14px',
                                fontWeight: 400,
                                lineHeight: '20px',
                                color: '#364153'
                              }}
                            >
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

                        // Button style based on tier and state
                        let buttonStyle: React.CSSProperties = {
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          fontWeight: 600,
                          lineHeight: '20px',
                          borderRadius: '8px',
                          width: '100%',
                          padding: '8px 0',
                        };
                        
                        if (isActiveTier) {
                          buttonStyle = {
                            ...buttonStyle,
                            backgroundColor: '#D1FAE5',
                            color: '#00C950',
                            border: '1px solid #A7F3D0',
                            cursor: 'default',
                          };
                        } else if (isUpgrade) {
                          buttonStyle = {
                            ...buttonStyle,
                            background: 'linear-gradient(90deg, rgba(166, 195, 255, 1) 0%, rgba(134, 93, 255, 1) 100%)',
                            color: '#FFFFFF',
                          };
                        } else if (isLower) {
                          buttonStyle = {
                            ...buttonStyle,
                            backgroundColor: '#F9FAFB',
                            color: '#6A7282',
                            border: '1px solid #E5E7EB',
                            cursor: 'not-allowed',
                            opacity: 0.5,
                          };
                        } else {
                          // Default button style - Premium tier uses gradient, others use white
                          if (isPremium) {
                            buttonStyle = {
                              ...buttonStyle,
                              background: 'linear-gradient(90deg, rgba(166, 195, 255, 1) 0%, rgba(134, 93, 255, 1) 100%)',
                              color: '#FFFFFF',
                            };
                          } else {
                            buttonStyle = {
                              ...buttonStyle,
                              backgroundColor: '#FFFFFF',
                              border: '1px solid rgba(0, 0, 0, 0.1)',
                              color: '#0A0A0A',
                            };
                          }
                        }

                        return (
                          <button
                            onClick={() => !isActiveTier && !isLower && handleSubscribe(tier)}
                            disabled={!!isSubscribing || isActiveTier || (isLower && !isUpgrade)}
                            className="transition-colors"
                            style={buttonStyle}
                            onMouseEnter={(e) => {
                              if (!isActiveTier && !isLower && !isUpgrade && !isPremium) {
                                e.currentTarget.style.backgroundColor = '#F9FAFB';
                              } else if (!isActiveTier && !isLower && !isUpgrade && isPremium) {
                                e.currentTarget.style.opacity = '0.9';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isActiveTier && !isLower && !isUpgrade && !isPremium) {
                                e.currentTarget.style.backgroundColor = '#FFFFFF';
                              } else if (!isActiveTier && !isLower && !isUpgrade && isPremium) {
                                e.currentTarget.style.opacity = '1';
                              }
                            }}
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
                  );
                  })}
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


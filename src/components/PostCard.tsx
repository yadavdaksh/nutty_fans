'use client';

import { formatDistanceToNow } from 'date-fns';
import { 
  Heart, 
  MoreHorizontal,
  Lock,
  Loader2 
} from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getWalletBalance, processTransaction } from '@/lib/db';
import { toast } from 'react-hot-toast';
import WatermarkMedia from './WatermarkMedia';
import AlertModal from './modals/AlertModal';


interface Post {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  timestamp: Timestamp | Date | { toDate: () => Date };
  isLocked?: boolean;
  price?: number;
}

export default function PostCard({ post }: { post: Post }) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [isUnlocked, setIsUnlocked] = useState(!post.isLocked);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);


  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };



  const handleUnlock = async () => {
    if (!user) {
      toast.error("Please login to unlock posts");
      return;
    }

    if (!post.price) return;

    const priceCents = Math.round(post.price * 100);

    // 1. Check Wallet Balance
    // Note: In real app we might cache this or pass it as prop, but fetching fresh is safer for payments
    const balance = await getWalletBalance(user.uid);
    if (balance < priceCents) {
       toast.error(`Insufficient wallet balance. You need $${post.price.toFixed(2)}.`);
       return;
    }

    setShowConfirmModal(true);
  };

  const processUnlock = async () => {
    if (!user || !post.price) return;
    const priceCents = Math.round(post.price * 100);

    setIsUnlocking(true);

    try {
      // 2. Process Transaction
      await processTransaction(
        user.uid,
        priceCents,
        `Unlock post by ${post.creatorName}`,
        { contentType: 'post_unlock', contentId: post.id, creatorId: post.creatorId }
      );

      // 3. Unlock (Client side update, purely visual for now effectively)
      // In real-world, we'd also call an API to 'add user to allowed viewers' in backend
      setIsUnlocked(true);
      toast.success("Post unlocked!");
    } catch (error) {
      console.error("Error unlocking:", error);
      toast.error("Failed to unlock post.");
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative">
            {post.creatorAvatar ? (
               <Image src={post.creatorAvatar} alt={post.creatorName} fill sizes="40px" className="object-cover" />
            ) : (
               <div className="w-full h-full flex items-center justify-center bg-purple-100 text-purple-600 font-bold">
                 {post.creatorName[0]}
               </div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{post.creatorName}</h3>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(
                post.timestamp instanceof Date 
                  ? post.timestamp 
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  : (post.timestamp as any)?.toDate?.() || new Date(), 
                { addSuffix: true }
              )}
            </p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-800 mb-3 whitespace-pre-wrap">{post.content}</p>
        
        {post.image && (
          <div className="rounded-xl overflow-hidden relative aspect-video bg-gray-100">
             {!isUnlocked ? (
               <div className="absolute inset-0 z-10">
                 <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center text-white">
                   <Lock className="w-12 h-12 mb-3 text-purple-400" />
                   <h4 className="text-lg font-bold mb-1">Locked Post</h4>
                   <p className="text-sm text-gray-300 mb-4">Unlock to view this exclusive content</p>
                   <button 
                     onClick={handleUnlock}
                     disabled={isUnlocking}
                     className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                   >
                     {isUnlocking ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                     Unlock for ${post.price?.toFixed(2)}
                   </button>
                 </div>
                 {/* Blurred generic background if we had 'blur hash', else just gray */}
                  <Image src={post.image} alt="Locked" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px" className="object-cover blur-2xl opacity-50" />
               </div>
             ) : (
               <WatermarkMedia 
                 src={post.image} 
                 alt="Post image" 
                 watermarkText={post.creatorName || 'NuttyFans'} 
               />
             )}
          </div>
        )}
      </div>

      {/* Actions */}
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-1.5 ${isLiked ? 'text-pink-600' : 'text-[#344054] hover:text-pink-600'} transition-colors`}
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm font-semibold">{likesCount + (isLiked ? 1 : 0)}</span>
          </button>
          

          

        </div>

        {/* Caption */}
        {post.content && (
          <div className="mb-2">
            <span className="font-bold text-[#101828] mr-2">
              {post.creatorName || 'Creator'}
            </span>
            <span className="text-[#344054] text-sm">
              {post.content}
            </span>
          </div>
        )}

        <AlertModal 
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Unlock Post"
          message={`Unlock this exclusive post for $${post.price?.toFixed(2)}? This will be deducted from your wallet balance.`}
          type="info"
          onConfirm={processUnlock}
          confirmLabel="Unlock Now"
          cancelLabel="Maybe Later"
        />
      </div>


  );
}

'use client';

import { Post, UserProfile } from '@/lib/db';
import { formatDistanceToNow } from 'date-fns';
import { Heart, Lock, MoreHorizontal } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface PostCardProps {
  post: Post;
  creator?: UserProfile; 
  isLocked?: boolean;
}

export default function PostCard({ post, creator, isLocked = false }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false); // Placeholder for local state

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-6">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative">
             <Image 
               src={creator?.photoURL || 'https://i.pravatar.cc/150'} 
               alt={creator?.displayName || 'Creator'} 
               fill
               className="object-cover"
             />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#101828]">
              {creator?.displayName || 'Creator Name'}
            </h3>
            <p className="text-xs text-[#667085]">
              {post.createdAt ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
            </p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="relative bg-black group">
        {post.isLocked && isLocked ? (
          <div className="aspect-square w-full flex flex-col items-center justify-center bg-gray-900 text-white p-8 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Premium Content</h3>
            <p className="text-gray-400 text-sm max-w-xs mb-6">
              Subscribe to unlock this post and see what you&apos;re missing.
            </p>
            <button className="px-6 py-2.5 bg-white text-black rounded-full font-bold hover:bg-gray-100 transition-colors">
              Unlock Post
            </button>
          </div>
        ) : (
          <>
            {post.type === 'video' ? (
              <video 
                src={post.mediaURL} 
                controls 
                className="w-full max-h-[600px] object-contain"
              />
            ) : (
              <div className="relative aspect-square w-full">
                <Image 
                  src={post.mediaURL} 
                  alt="Post content" 
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={() => setIsLiked(!isLiked)}
            className={`flex items-center gap-1.5 ${isLiked ? 'text-pink-600' : 'text-[#344054] hover:text-pink-600'} transition-colors`}
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm font-semibold">{post.likesCount + (isLiked ? 1 : 0)}</span>
          </button>
          

          

        </div>

        {/* Caption */}
        {post.content && (
          <div className="mb-2">
            <span className="font-bold text-[#101828] mr-2">
              {creator?.displayName || 'Creator'}
            </span>
            <span className="text-[#344054] text-sm">
              {post.content}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

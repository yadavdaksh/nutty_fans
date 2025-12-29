'use client';

import { Post } from '@/lib/db';
import { Play, Lock } from 'lucide-react';
import Image from 'next/image';

interface PostGridProps {
  posts: Post[];
  onPostClick?: (post: Post) => void;
}

export default function PostGrid({ posts, onPostClick }: PostGridProps) {
  return (
    <div className="grid grid-cols-3 gap-0.5 md:gap-1 lg:gap-4">
      {posts.map((post) => (
        <div 
          key={post.id} 
          className="relative aspect-square bg-gray-100 cursor-pointer group overflow-hidden"
          onClick={() => onPostClick?.(post)}
        >
          {/* Media */}
          {post.type === 'video' ? (
             <video 
               src={post.mediaURL} 
               className="w-full h-full object-cover"
             />
          ) : (
            <Image 
              src={post.mediaURL} 
              alt={post.content || 'Post image'} 
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
          )}

          {/* Overlays */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

          {/* Type Indicators */}
          <div className="absolute top-2 right-2 text-white drop-shadow-md">
            {post.isLocked && <Lock className="w-5 h-5" />}
            {!post.isLocked && post.type === 'video' && <Play className="w-5 h-5 fill-current" />}
          </div>
          
          {/* Hover Stats (Desktop only mainly, but good for feedback) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-4 text-white font-bold">
               {/* Could add Likes/Comments count here later */}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

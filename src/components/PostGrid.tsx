'use client';

import { Post } from '@/lib/db';
import { Play, Lock } from 'lucide-react';
import WatermarkMedia from './WatermarkMedia';

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
          <div className="w-full h-full" onClick={() => {
             // If we have an external handler, let it handle the click (and prevent lightbox if needed)
             // But here we want lightbox. WatermarkMedia handles its own click.
             // If onPostClick is present, we might want to prioritize it? 
             // Usually PostGrid is for navigation OR viewing. 
             // If onPostClick is passed, it's likely for navigation. 
             // But if we want lightbox, we should let WatermarkMedia handle it.
             // Let's just render WatermarkMedia. The container's onClick will catch bubbles if WatermarkMedia doesn't stop prop.
             // WatermarkMedia DOES stop propagation.
          }} >
             <WatermarkMedia
                src={post.mediaURL}
                type={post.type as 'image' | 'video'}
                alt={post.content || 'Post media'}
                className="w-full h-full"
             />
          </div>

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

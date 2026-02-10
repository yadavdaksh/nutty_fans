'use client';

import { X } from 'lucide-react';
import Image from 'next/image';
import { useEffect } from 'react';

interface MediaLightboxProps {
  src: string;
  type: 'image' | 'video';
  onClose: () => void;
  alt?: string;
}

export default function MediaLightbox({ src, type, onClose, alt = 'Media content' }: MediaLightboxProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-white/20 transition-colors z-[10000]"
      >
        <X className="w-8 h-8" />
      </button>

      <div 
        className="relative max-w-full max-h-full w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()} // Prevent clicking background from closing when clicking content (optional, but usually good)
      >
        {type === 'image' ? (
          <div className="relative w-full h-full max-w-5xl max-h-[90vh]">
            <Image 
              src={src} 
              alt={alt} 
              fill 
              className="object-contain" 
              unoptimized 
            />
          </div>
        ) : (
          <video 
            src={src} 
            controls 
            autoPlay 
            className="max-w-full max-h-[90vh] object-contain shadow-2xl"
            onContextMenu={(e) => e.preventDefault()}
            controlsList="nodownload" 
          />
        )}
      </div>
    </div>
  );
}

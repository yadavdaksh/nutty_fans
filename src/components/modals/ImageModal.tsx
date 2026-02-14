'use client';

import { X } from 'lucide-react';
import Image from 'next/image';
import { useEffect } from 'react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt?: string;
}

export default function ImageModal({ isOpen, onClose, imageUrl, alt = 'Image' }: ImageModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-[101]"
      >
        <X className="w-8 h-8" />
      </button>
      
      <div 
        className="relative w-full max-w-4xl h-[80vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image container
      >
        <div className="relative w-full h-full">
          <Image 
            src={imageUrl} 
            alt={alt} 
            fill 
            className="object-contain" // Keep aspect ratio
            priority
            sizes="100vw"
          />
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import Image from 'next/image';

interface WatermarkMediaProps {
  src: string;
  alt: string;
  type?: 'image' | 'video';
  watermarkText?: string;
  className?: string;
}

export default function WatermarkMedia({
  src,
  alt,
  type = 'image',
  watermarkText = 'NuttyFans.com',
  className = '',
}: WatermarkMediaProps) {
  
  const preventCaptureProps = {
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    onDragStart: (e: React.DragEvent) => e.preventDefault(),
  };

  return (
    <div {...preventCaptureProps} className={`relative overflow-hidden group select-none ${className}`}>
      {/* The Actual Media */}
      {type === 'image' ? (
        <Image 
          src={src} 
          alt={alt} 
          fill 
          className="object-cover transition-transform duration-500 group-hover:scale-105" 
          unoptimized 
        />
      ) : (
        <video 
          src={src} 
          className="w-full h-full object-cover" 
          controlsList="nodownload" 
          onContextMenu={(e) => e.preventDefault()}
        />
      )}

      {/* Watermark Overlay (Repeated Pattern) */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.07] flex flex-wrap content-around justify-around gap-20 overflow-hidden rotate-[-30deg] scale-150">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className="text-black font-black text-2xl whitespace-nowrap uppercase tracking-widest">
            {watermarkText}
          </span>
        ))}
      </div>

      {/* Center Main Watermark */}
      <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
         <div className="bg-white/10 backdrop-blur-[2px] px-4 py-1 rounded-full border border-white/20 opacity-30">
            <span className="text-white font-bold text-sm tracking-widest uppercase">{watermarkText}</span>
         </div>
      </div>

      {/* Anti-Capture Overlay */}
      <div 
        className="absolute inset-0 z-30 select-none bg-transparent" 
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}

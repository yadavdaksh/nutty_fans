'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';

export default function AdultDisclaimer() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show on every reload (using session storage to track reload vs navigation)
    // Actually user said "everytime the page is reloaded, but not on redirection"
    // We can use a combination of memory state (which clears on reload)
    // Since this is a client component in LayoutShell, and LayoutShell persists across routes (usually)
    // But in Next.js, navigation might not remount LayoutShell if it's in layout.tsx.
    // If it's in layout.tsx, it stays alive. Reload kills JS state -> show = false -> useEffect -> show = true.
    
    setShow(true);
  }, []);

  if (!show) return null;

  const handleAccept = () => {
    setShow(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight uppercase">Adult Content Warning</h2>
          <p className="text-gray-600 font-medium leading-relaxed mb-8">
            This website contains adult-oriented content and is intended for individuals aged <span className="text-black font-bold">18 years or older</span>. By entering, you confirm you are of legal age.
          </p>
          <div className="space-y-3">
            <button 
              onClick={handleAccept}
              className="w-full py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all active:scale-[0.98]"
            >
              I am 18+ and I Agree
            </button>
            <button 
              onClick={() => window.location.href = 'https://google.com'}
              className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
            >
              I Disagree / Exit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import {
  LiveKitRoom,
  VideoConference,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { Loader2, Video, X, Globe, Users, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function GoLivePage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [token, setToken] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [title, setTitle] = useState('');
  const [accessType, setAccessType] = useState<'public' | 'subscribers' | 'paid'>('public');
  const [price, setPrice] = useState('');
  const [chatPrice, setChatPrice] = useState(''); // Price per message
  const [showSummary, setShowSummary] = useState(false);
  const [finalEarnings, setFinalEarnings] = useState(0);

  useEffect(() => {
    if (userProfile && userProfile.role !== 'creator') {
      router.push('/dashboard');
    }
  }, [userProfile, router]);

  const startStream = async () => {
    if (!title || !user?.displayName) return;
    
    // Create a unique room name
    const room = `stream-${user.uid}-${Date.now()}`;

    try {
      const resp = await fetch(
        `/api/livekit/auth?room=${room}&username=${user.uid}&participantName=${encodeURIComponent(user.displayName)}&mode=publisher`
      );
      const data = await resp.json();
      setToken(data.token);

      // Create stream document in Firestore
      await setDoc(doc(db, 'streams', user.uid), {
        id: room,
        creatorId: user.uid,
        isActive: true,
        title: title,
        accessType: accessType,
        price: accessType === 'paid' ? parseFloat(price) : 0,
        chatPrice: chatPrice ? parseFloat(chatPrice) : 0,
        totalEarnings: 0,
        viewerCount: 0,
        startedAt: new Date()
      });

      setIsLive(true);
    } catch (e) {
      console.error(e);
      alert('Failed to start stream');
    }
  };

  const endStream = async () => {
     try {
        // Fetch final earnings before closing
        const streamRef = doc(db, 'streams', user!.uid);
        // We use getDoc to be sure we have the latest
        // (Though if we used onSnapshot we'd have it, but let's be safe)
        // Note: For MVP we just read the doc.
        const snap = await import('firebase/firestore').then(mod => mod.getDoc(streamRef)); 
        if (snap.exists()) {
           setFinalEarnings(snap.data().totalEarnings || 0);
        }

        await updateDoc(streamRef, {
            isActive: false
        });
     } catch (e) {
         console.error("Error setting stream inactive", e);
     }
     
     setIsLive(false);
     setToken('');
     setShowSummary(true);
  };

  if (!userProfile) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  if (showSummary) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white p-4">
         <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
               <DollarSign className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Stream Ended</h2>
            <p className="text-gray-400 mb-8">Here&apos;s how much you earned from this session:</p>
            
            <div className="bg-black/50 rounded-xl p-6 mb-8 border border-gray-800">
               <div className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-1">Total Earnings</div>
               <div className="text-4xl font-bold text-green-400">
                 ${finalEarnings.toFixed(2)}
               </div>
            </div>

            <button 
              onClick={() => router.push('/dashboard')}
              className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Close & Go to Dashboard
            </button>
            <p className="text-xs text-gray-500 mt-4">
              This summary will disappear once you leave.
            </p>
         </div>
      </div>
    );
  }

  if (isLive && token) {
    return (
      <div className="h-screen w-full bg-black flex flex-col">
          <div className="bg-gray-900 p-4 flex justify-between items-center text-white border-b border-gray-800">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-bold">LIVE: {title}</span>
             </div>
             <button 
                onClick={endStream}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
             >
                <X className="w-4 h-4" /> End Stream
             </button>
          </div>
          
        <LiveKitRoom
          video={true}
          audio={true}
          token={token}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
          data-lk-theme="default"
          className="flex-1"
          onDisconnected={endStream}
        >
          <VideoConference />
        </LiveKitRoom>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
         <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Go Live</h1>
            <p className="text-white/80">Broadcast to your fans instantly</p>
         </div>
         
         <div className="p-8">
            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Stream Title</label>
                <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Q&A Session - Ask me anything!"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-gray-900"
                />
            </div>

            <div className="mb-6">
               <label className="block text-sm font-semibold text-gray-700 mb-2">Who can watch?</label>
               <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => setAccessType('public')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${accessType === 'public' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                  >
                    <Globe className="w-5 h-5 mb-1" />
                    <span className="text-xs font-medium">Public</span>
                  </button>
                  <button 
                    onClick={() => setAccessType('subscribers')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${accessType === 'subscribers' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                  >
                    <Users className="w-5 h-5 mb-1" />
                    <span className="text-xs font-medium">Subscribers</span>
                  </button>
                  <button 
                    onClick={() => setAccessType('paid')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${accessType === 'paid' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                  >
                    <DollarSign className="w-5 h-5 mb-1" />
                    <span className="text-xs font-medium">Paid</span>
                  </button>
               </div>
            </div>

            {accessType === 'paid' && (
              <div className="mb-6 animate-in fade-in slide-in-from-top-2">
                 <label className="block text-sm font-semibold text-gray-700 mb-2">Entry Price ($)</label>
                 <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="number" 
                        min="1"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="5.00"
                        className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-gray-900"
                    />
                 </div>
              </div>
            )}

            <div className="mb-6">
                 <label className="block text-sm font-semibold text-gray-700 mb-2">Chat Price (Per Message)</label>
                 <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="number" 
                        min="0"
                        step="0.5"
                        value={chatPrice}
                        onChange={(e) => setChatPrice(e.target.value)}
                        placeholder="0 (Free)"
                        className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-gray-900"
                    />
                 </div>
                 <p className="text-xs text-gray-500 mt-1">Leave empty or 0 for free chat.</p>
            </div>
            
            <button
                onClick={startStream}
                disabled={!title}
                className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
                Start Broadcast
            </button>
         </div>
      </div>
    </div>
  );
}

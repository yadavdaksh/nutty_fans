'use client';

import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import {
  LiveKitRoom,
  useParticipants,
  useLocalParticipant,
  VideoTrack,
  ConnectionStateToast,
  RoomAudioRenderer,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import '@livekit/components-styles';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, Video, VideoOff, Mic, MicOff, X, Globe, Users, DollarSign, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import LiveChat from '@/components/LiveChat';


export default function GoLivePage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [token, setToken] = useState('');
  const [roomName, setRoomName] = useState('');
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
      const creatorIdentity = `${user.uid}-creator`;
      const resp = await fetch(
        `/api/livekit/auth?room=${room}&username=${creatorIdentity}&participantName=${encodeURIComponent(user.displayName)}&mode=publisher`
      );
      const data = await resp.json();
      setToken(data.token);
      setRoomName(room);

      // Create stream document in Firestore
      await setDoc(doc(db, 'streams', user.uid), {
        id: room,
        creatorId: user.uid,
        isActive: true,
        title: title,
        accessType: accessType,
        price: accessType === 'paid' ? parseFloat(price) : 0,
        chatPrice: chatPrice ? parseFloat(chatPrice) : 0,
        totalEarnings: 0, // Explicitly reset for new session
        createdAt: serverTimestamp(),
        viewerCount: 0,
        startedAt: new Date()
      });

      setIsLive(true);
    } catch (e) {
      console.error(e);
      toast.error('Failed to start stream');
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
           setFinalEarnings((snap.data().totalEarnings || 0) / 100);
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
      <div className="h-screen w-full bg-black flex flex-col overflow-hidden">
        <LiveKitRoom
          video={true}
          audio={true}
          token={token}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
          data-lk-theme="default"
          className="flex-1 flex flex-col md:flex-row h-full"
          onDisconnected={endStream}
        >
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col h-full bg-[#050505]">
            {/* Professional Header */}
            <div className="bg-[#111111] p-4 flex justify-between items-center text-white border-b border-white/5 z-50">
               <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]"></div>
                     <span className="font-bold uppercase text-[10px] tracking-[0.2em] text-white/90">Live: {title}</span>
                  </div>
                  <div className="h-4 w-px bg-white/10" />
                  <ViewerCount />
               </div>

               <div className="flex items-center gap-3">
                  <MediaControls />
                  <div className="h-4 w-px bg-white/10 mx-1" />
                  <button 
                    onClick={endStream}
                    className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-4 py-1.5 rounded-full text-xs font-bold transition-all border border-red-500/20 flex items-center gap-2"
                  >
                    <X className="w-3.5 h-3.5" /> End Stream
                  </button>
               </div>
            </div>
            
            {/* Monitor Area */}
            <div className="flex-1 relative bg-black overflow-hidden flex items-center justify-center group">
               <CreatorMonitor />
               
               {/* Dashboard Overlay - Subtle bits */}
               <div className="absolute bottom-6 left-6 z-20">
                  <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-3 rounded-2xl flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {user?.displayName?.[0] || 'C'}
                     </div>
                     <div>
                        <div className="text-white text-xs font-bold">{user?.displayName}</div>
                        <div className="text-white/40 text-[10px]">Broadcasting via NuttyFans</div>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Sidebar Chat */}
          <div className="w-full md:w-[320px] lg:w-[380px] h-1/2 md:h-full border-l border-white/5 bg-[#0a0a0a] flex flex-col z-10">
             <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
                <h3 className="text-white/70 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare className="w-3 h-3 text-purple-500" />
                  Live Chat
                </h3>
             </div>
             <div className="flex-1 min-h-0">
                <LiveChat 
                  streamId={roomName || user!.uid} 
                  creatorId={user!.uid}
                  chatPrice={parseFloat(chatPrice) || 0}
                />
             </div>
          </div>

          <RoomAudioRenderer />
          <ConnectionStateToast />
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

function ViewerCount() {
  const participants = useParticipants();
  return (
    <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-wider">
      <Users className="w-3 h-3" />
      <span>{Math.max(0, participants.length - 1)} Viewers</span>
    </div>
  );
}

function MediaControls() {
  const { isMicrophoneEnabled, isCameraEnabled, localParticipant } = useLocalParticipant();

  return (
    <div className="flex items-center gap-2">
       <button 
        onClick={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
        className={`p-2 rounded-lg transition-all border ${isMicrophoneEnabled ? 'bg-white/5 border-white/10 text-white/70' : 'bg-red-500/20 border-red-500/50 text-red-500'}`}
       >
         {isMicrophoneEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
       </button>
       <button 
        onClick={() => localParticipant.setCameraEnabled(!isCameraEnabled)}
        className={`p-2 rounded-lg transition-all border ${isCameraEnabled ? 'bg-white/5 border-white/10 text-white/70' : 'bg-red-500/20 border-red-500/50 text-red-500'}`}
       >
         {isCameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
       </button>
    </div>
  );
}

function CreatorMonitor() {
  const { cameraTrack, localParticipant } = useLocalParticipant();
  
  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      {cameraTrack ? (
        <VideoTrack 
          trackRef={{
            participant: localParticipant,
            source: Track.Source.Camera,
            publication: cameraTrack
          }} 
          className="w-full h-full object-contain" 
        />
      ) : (
        <div className="flex flex-col items-center gap-4">
           <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
              <VideoOff className="w-6 h-6 text-white/20" />
           </div>
           <p className="text-white/20 text-xs font-bold uppercase tracking-widest">Camera is off</p>
        </div>
      )}
    </div>
  );
}

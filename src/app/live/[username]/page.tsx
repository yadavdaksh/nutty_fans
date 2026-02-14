'use client';

import { useAuth } from '@/context/AuthContext';
import { db, Stream, UserProfile } from '@/lib/db';
import {
  LiveKitRoom,
  VideoTrack, 
  AudioTrack, 
  useTracks, 
  useParticipants,
  ConnectionStateToast,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { Loader2, Lock, CreditCard, Home, Play, Users, X } from 'lucide-react';
import { useStreamAccess } from '@/hooks/useStreamAccess';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LiveChat from '@/components/LiveChat'; // Custom Chat Component
import Image from 'next/image';
import { Track } from 'livekit-client';

interface StreamWithCreator extends Stream {
  creator?: UserProfile;
}

export default function ViewerPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { username } = useParams(); // username is actually the creator's UID
  const [token, setToken] = useState('');
  const [streamData, setStreamData] = useState<StreamWithCreator | null>(null);
  const [error, setError] = useState('');
  
  // Custom hook to check access permissions
  const { hasAccess, loading: accessLoading } = useStreamAccess(streamData);

  useEffect(() => {
    const fetchStream = async () => {
      if (!username) return;

      try {
        const q = query(
            collection(db, 'streams'),
            where('creatorId', '==', username),
            where('isActive', '==', true)
        );
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            setError('offline');
            return;
        }

        const data = snapshot.docs[0].data() as StreamWithCreator;
        
        // Fetch creator details for the UI
        try {
          const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', data.creatorId)));
          if (!userDoc.empty) {
            data.creator = userDoc.docs[0].data() as UserProfile;
          }
        } catch (e) {
          console.error("Error fetching creator", e);
        }

        setStreamData(data);
      } catch (e) {
          console.error("Error fetching stream", e);
          setError('error');
      }
    };

    fetchStream();

    // Listen for changes to the stream status in real-time
    let unsubscribe: () => void;
    if (username) {
      const q = query(
        collection(db, 'streams'),
        where('creatorId', '==', username),
        where('isActive', '==', true)
      );
      unsubscribe = onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
          setError('offline');
          setStreamData(null);
        } else {
          const data = snapshot.docs[0].data() as StreamWithCreator;
          setError('');
          setStreamData(prev => ({ ...data, creator: prev?.creator }));
        }
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [username]);

  // Once access is confirmed, get the token
  useEffect(() => {
    if (hasAccess && streamData && user) {
        const getToken = async () => {
            try {
                // Append -viewer-timestamp to ensure unique identity if testing with same account
                const viewerIdentity = `${user.uid}-viewer-${Date.now()}`;
                const resp = await fetch(
                    `/api/livekit/auth?room=${streamData.id}&username=${viewerIdentity}&participantName=${encodeURIComponent(user.displayName || 'Viewer')}&mode=subscriber`
                );
                const data = await resp.json();
                setToken(data.token);
            } catch (e) {
                console.error("Error getting token", e);
            }
        };
        getToken();
    }
  }, [hasAccess, streamData, user]);

  if (!streamData && !error) {
    return (
        <div className="flex h-screen items-center justify-center bg-black text-white">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <span className="ml-2">Finding stream...</span>
        </div>
    );
  }

  if (error === 'offline') {
      return (
        <div className="flex h-screen items-center justify-center bg-black text-white flex-col p-6 text-center">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <Play className="w-10 h-10 text-gray-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Stream Offline</h1>
            <p className="text-gray-400 mb-8 max-w-sm">This creator is not live right now. They might have ended the session or haven&apos;t started yet.</p>
            <button 
                onClick={() => router.push('/live')}
                className="flex items-center gap-2 bg-white text-black font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition-colors"
            >
                <Home className="w-4 h-4" />
                Return to Live Streams
            </button>
        </div>
      );
  }

  if (accessLoading) {
     return (
        <div className="flex h-screen items-center justify-center bg-black text-white">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <span className="ml-2">Verifying access...</span>
        </div>
    );
  }

  if (!hasAccess) {
      return (
        <div className="flex h-screen items-center justify-center bg-black text-white flex-col p-8 text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <Lock className="w-8 h-8 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            
            {streamData?.accessType === 'subscribers' && (
                <>
                    <p className="text-gray-400 mb-6">This stream is exclusively for subscribers.</p>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition-colors w-full mb-4">
                        Subscribe now
                    </button>
                </>
            )}

            {streamData?.accessType === 'paid' && (
                <>
                    <p className="text-gray-400 mb-6">Purchase a ticket to watch this stream.</p>
                    <div className="text-green-400 text-3xl font-bold mb-6">${streamData.price?.toFixed(2)}</div>
                    <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full transition-colors w-full flex items-center justify-center gap-2 mb-4">
                        <CreditCard className="w-4 h-4" />
                        Purchase Access
                    </button>
                </>
            )}

            <button 
                onClick={() => router.push('/live')}
                className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
            >
                Return to Live Streams
            </button>
        </div>
      );
  }

  if (!token) {
       return (
        <div className="flex h-screen items-center justify-center bg-black text-white">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <span className="ml-2">Connecting to secure stream...</span>
        </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black flex flex-col md:flex-row overflow-hidden">
      <LiveKitRoom
        video={false} 
        audio={false} 
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        data-lk-theme="default"
        className="h-screen w-full flex flex-col md:flex-row"
      >
        <div className="flex-1 relative bg-gray-950 flex items-center justify-center group overflow-hidden">
             <BroadcastUI />
             
             {/* Stream HUD */}
             <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm animate-pulse uppercase tracking-wider">
                  Live
                </div>
                <div className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-sm flex items-center gap-1.5 border border-white/10 uppercase tracking-wider">
                  <Users className="w-3 h-3" />
                  <ParticipantCount />
                </div>
             </div>

             <div className="absolute top-4 right-4 z-20">
                <button 
                  onClick={() => router.push('/live')}
                  className="p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-all border border-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
             </div>

             <div className="absolute bottom-6 left-6 z-20 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden shadow-2xl">
                   {streamData?.creator && (
                     <Image 
                      src={streamData.creator.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(streamData.creator.displayName || 'C')}`} 
                      alt="Creator"
                      width={48}
                      height={48}
                      className="object-cover"
                     />
                   )}
                </div>
                <div className="text-white drop-shadow-lg">
                   <h2 className="text-lg font-bold leading-none mb-1">{streamData?.title}</h2>
                   <p className="text-sm font-medium opacity-80">@{streamData?.creator?.displayName}</p>
                </div>
             </div>
        </div>

        <div className="w-full md:w-[360px] h-1/2 md:h-full border-l border-white/5 bg-[#0a0a0b] flex flex-col shadow-2xl z-10 transition-all">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
               <h3 className="text-white font-bold text-sm tracking-tight flex items-center gap-2">
                 <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                 Live Chat
               </h3>
            </div>
            <div className="flex-1 min-h-0 bg-transparent">
                <LiveChat 
                    streamId={streamData?.id || ''} 
                    creatorId={streamData?.creatorId || ''}
                    chatPrice={streamData?.chatPrice || 0}
                />
            </div>
        </div>

        <RoomAudioRenderer />
        <ConnectionStateToast />
      </LiveKitRoom>
    </div>
  );
}

function BroadcastUI() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: false },
      { source: Track.Source.Microphone, withPlaceholder: false },
    ]
  );

  const videoTrack = tracks.find((t) => t.source === Track.Source.Camera);
  const audioTrack = tracks.find((t) => t.source === Track.Source.Microphone);

  return (
    <div className="w-full h-full flex items-center justify-center bg-black relative">
      {videoTrack?.publication ? (
        <VideoTrack trackRef={videoTrack} className="w-full h-full object-contain" />
      ) : (
        <div className="flex flex-col items-center gap-4">
           <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
           </div>
           <p className="text-white/60 font-medium animate-pulse">Waiting for broadcast signals...</p>
        </div>
      )}
      {audioTrack?.publication && <AudioTrack trackRef={audioTrack} />}
    </div>
  );
}

function ParticipantCount() {
  const participants = useParticipants();
  // We subtract 1 to exclude the creator (publisher)
  return <>{Math.max(0, participants.length - 1)}</>;
}

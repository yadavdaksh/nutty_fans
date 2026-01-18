'use client';

import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import {
  LiveKitRoom,
  VideoConference,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Loader2, Lock, CreditCard } from 'lucide-react';
import { Stream } from '@/lib/db';
import { useStreamAccess } from '@/hooks/useStreamAccess';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import LiveChat from '@/components/LiveChat'; // Custom Chat Component

export default function ViewerPage() {
  const { user } = useAuth();
  const { username } = useParams(); // username is actually the creator's UID
  const [token, setToken] = useState('');
  const [streamData, setStreamData] = useState<Stream | null>(null);
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

        const data = snapshot.docs[0].data() as Stream;
        setStreamData(data);
      } catch (e) {
          console.error("Error fetching stream", e);
          setError('error');
      }
    };

    fetchStream();
  }, [username]);

  // Once access is confirmed, get the token
  useEffect(() => {
    if (hasAccess && streamData && user) {
        const getToken = async () => {
            try {
                const resp = await fetch(
                    `/api/livekit/auth?room=${streamData.id}&username=${user.uid}&participantName=${encodeURIComponent(user.displayName || 'Viewer')}&mode=subscriber`
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
        <div className="flex h-screen items-center justify-center bg-black text-white flex-col">
            <h1 className="text-2xl font-bold mb-2">Stream Offline</h1>
            <p className="text-gray-400">This creator is not live right now.</p>
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
                    <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition-colors w-full">
                        Subscribe now
                    </button>
                </>
            )}

            {streamData?.accessType === 'paid' && (
                <>
                    <p className="text-gray-400 mb-6">Purchase a ticket to watch this stream.</p>
                    <div className="text-3xl font-bold mb-6 text-green-400">${streamData.price?.toFixed(2)}</div>
                    <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full transition-colors w-full flex items-center justify-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Purchase Access
                    </button>
                </>
            )}
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
    <div className="h-screen w-full bg-black flex flex-col md:flex-row">
      <LiveKitRoom
        video={false} // Viewers verify don't publish video
        audio={false} // Viewers don't publish audio
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        data-lk-theme="default"
        className="h-full w-full flex flex-col md:flex-row"
      >
        {/* Main Video Area */}
        <div className="flex-1 relative bg-black flex items-center justify-center">
             <VideoConference chatMessageFormatter={() => null} />
             {/* Note: We use VideoConference but hide its default chat via CSS or just ignore it 
                 Actually VideoConference is a full UI. To separate chat we might need to be more custom 
                 but for speed we can try to rely on layout or just put VideoConference in the left.
                 However, VideoConference usually takes full width. 
                 
                 BETTER: Use CarouselLayout + standard components if we want total control. 
                 BUT: VideoConference is easiest to ensure video works. 
                 Let's wrap it and assume we can overlay or side-by-side. 
             */}
             <style jsx global>{`
                .lk-chat-toggle { display: none !important; } 
             `}</style>
        </div>

        {/* Custom Sidebar Chat */}
        <div className="w-full md:w-80 h-1/3 md:h-full border-l border-gray-800 bg-gray-900 z-10">
            {streamData && (
                <LiveChat 
                    streamId={streamData.id} 
                    creatorId={streamData.creatorId}
                    chatPrice={streamData.chatPrice || 0}
                />
            )}
        </div>
      </LiveKitRoom>
    </div>
  );
}

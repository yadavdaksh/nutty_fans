'use client';

import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, Phone, Video as VideoIcon, X } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Call } from '@/lib/db';
import { getConversationId, logSystemMessage } from '@/lib/messaging';

export default function CallPage() {
  const { callId } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  
  const [token, setToken] = useState('');
  const [callData, setCallData] = useState<Call | null>(null);
  const [callStatus, setCallStatus] = useState<'loading' | 'ringing' | 'active' | 'ended' | 'rejected' | 'busy'>('loading');

  useEffect(() => {
    if (!callId) return;

    // Subscribe to call status
    const unsub = onSnapshot(doc(db, 'calls', callId as string), (doc) => {
        if (doc.exists()) {
            const data = doc.data() as Call;
            setCallData({ ...data, id: doc.id });
            setCallStatus(data.status);
        } else {
            router.push('/messages');
        }
    });

    return () => unsub();
  }, [callId, router]);

  // Handle Token Generation when status becomes active
  useEffect(() => {
    if (callStatus === 'active' && user && callData && !token) {
        const fetchToken = async () => {
             try {
                const room = `call-${callData.id}`;
                const resp = await fetch(
                    `/api/livekit/auth?room=${room}&username=${user.uid}&participantName=${encodeURIComponent(user.displayName || 'User')}&mode=publisher`
                );
                const data = await resp.json();
                setToken(data.token);
             } catch (e) {
                 console.error("Error fetching token", e);
             }
        };
        fetchToken();
    }
  }, [callStatus, user, callData, token]);



  const endCall = useCallback(async () => {
      // If ringing, it's a cancellation. If active, it's ending.
      const newStatus = callStatus === 'ringing' ? 'rejected' : 'ended';
      
      if (callId && callData) {
          try {
             await updateDoc(doc(db, 'calls', callId as string), {
                 status: newStatus,
                 endTime: serverTimestamp() 
             });

             // Log system message
             try {
                const convId = getConversationId(callData.callerId, callData.receiverId);
                const text = newStatus === 'rejected' ? 'Call declined/cancelled' : 'Call ended';
                await logSystemMessage(convId, text, 'call');
             } catch (e) {
                console.error("Failed to log system message", e);
             }

          } catch (e) {
              console.error("Error updating call status", e);
          }
      }
      router.push('/messages');
  }, [callStatus, callId, callData, router]);

  // Handle 60s timeout for ringing calls
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (callStatus === 'ringing') {
        timeout = setTimeout(() => {
            endCall(); 
        }, 60000);
    }

    return () => clearTimeout(timeout);
  }, [callStatus, endCall]);

  if (callStatus === 'loading' || !callData) {
      return (
        <div className="h-screen w-full bg-black flex items-center justify-center text-white">
            <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      );
  }

  if (callStatus === 'ringing') {
       return (
        <div className="h-screen w-full bg-gray-900 flex flex-col items-center justify-center text-white p-4">
            <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center mb-8 animate-pulse">
                {callData.type === 'video' ? <VideoIcon className="w-16 h-16 text-gray-400" /> : <Phone className="w-16 h-16 text-gray-400" />}
            </div>
            <h2 className="text-2xl font-bold mb-2">Calling...</h2>
            <p className="text-gray-400 mb-8">Waiting for creator to join</p>
            
            <div className="mt-8 p-4 bg-gray-800 rounded-xl max-w-sm w-full">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Rate</span>
                    <span className="font-bold">${callData.pricePerMinute?.toFixed(2)}/min</span>
                </div>
                <div className="text-xs text-center text-gray-500 mt-2">
                    Billing starts when call is connected
                </div>
            </div>

            <button 
                onClick={endCall}
                className="mt-16 w-16 h-16 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg"
            >
                <X className="w-8 h-8" />
            </button>
        </div>
       );
  }

  if (callStatus === 'active' && token) {
      return (
        <div className="h-screen w-full bg-black flex flex-col">
            <LiveKitRoom
                video={callData.type === 'video'}
                audio={true}
                token={token}
                serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
                data-lk-theme="default"
                className="flex-1"
                onDisconnected={endCall}
            >
                <VideoConference />
            </LiveKitRoom>
             <button 
                onClick={endCall}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-600 text-white rounded-full font-bold shadow-xl hover:bg-red-700 transition-colors z-50 flex items-center gap-2"
            >
                <X className="w-5 h-5" /> End Call
            </button>
        </div>
      );
  }

  return (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center text-white">
        <h2 className="text-xl font-bold mb-4">Call Ended</h2>
        <button onClick={endCall} className="bg-gray-800 px-6 py-2 rounded-full">Go Back</button>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { db } from '@/lib/db';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { getConversationId, logSystemMessage } from '@/lib/messaging';
import { useRouter } from 'next/navigation';

export function useCall() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const startCall = async (callerId: string, receiverId: string, type: 'audio' | 'video', price: number, callerName: string, callerPhotoURL?: string) => {
    try {
      setLoading(true);

      // Check for existing calls (User is caller OR receiver)
      const callsRef = collection(db, 'calls');
      
      // Splitting into two simple queries to avoid index/syntax issues
      const q1 = query(
        callsRef, 
        where('callerId', '==', callerId),
        where('status', 'in', ['ringing', 'active'])
      );
      const q2 = query(
        callsRef, 
        where('receiverId', '==', callerId),
        where('status', 'in', ['ringing', 'active'])
      );
      
      const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      
      const allCalls = [...snap1.docs, ...snap2.docs];
      const now = Date.now();
      const STALE_RINGING_MS = 60 * 1000; // 1 minute (matches timeout)
      const STALE_ACTIVE_MS = 10 * 60 * 1000; // 10 minutes

      console.log("Checking concurrent calls. Found raw docs:", allCalls.length);

      const activeCalls = allCalls.filter(doc => {
        const data = doc.data();
        if (!data.startTime) return false;
        
        let startTime = 0;
        try {
            startTime = data.startTime.toMillis ? data.startTime.toMillis() : (data.startTime.seconds * 1000) || 0;
        } catch (e) {
            console.error("Error parsing startTime", e);
            return false; // Skip if invalid
        }
        
        const elapsed = now - startTime;
        console.log(`Call ${doc.id}: status=${data.status}, elapsed=${elapsed/1000}s`);

        if (data.status === 'ringing' && elapsed > STALE_RINGING_MS) {
            console.log(`Call ${doc.id} is stale ringing. Ignoring.`);
            return false;
        }
        if (data.status === 'active' && elapsed > STALE_ACTIVE_MS) {
             console.log(`Call ${doc.id} is stale active. Ignoring.`);
             return false;
        }

        return true;
      });

      console.log("Blocking active calls:", activeCalls.length);

      if (activeCalls.length > 0) {
        alert("You are already in a call! (Check Console for details)");
        setLoading(false);
        return;
      }

      // Create call document
      const callDoc = await addDoc(collection(db, 'calls'), {
        callerId,
        receiverId,
        type,
        status: 'ringing', // Initial status
        pricePerMinute: price,
        startTime: serverTimestamp(),
        callerName,
        callerPhotoURL: callerPhotoURL || null
      });
      
      // Navigate to call page (waiting room)
      router.push(`/call/${callDoc.id}`);

      // Log system message in chat
      try {
        const convId = getConversationId(callerId, receiverId);
        await logSystemMessage(convId, `${type === 'video' ? 'Video' : 'Audio'} Call started`, 'call');
      } catch (e) {
        console.error("Failed to log system message", e);
      }
    } catch (error) {
      console.error("Error starting call:", error);
      alert("Failed to start call");
    } finally {
      setLoading(false);
    }
  };

  return { startCall, loading };
}

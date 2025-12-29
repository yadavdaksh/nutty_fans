'use client';

import { useAuth } from '@/context/AuthContext';
import { db, Call } from '@/lib/db';
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function useIncomingCalls() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [incomingCall, setIncomingCall] = useState<Call | null>(null);

  useEffect(() => {
    if (!user || userProfile?.role !== 'creator') return;

    console.log("useIncomingCalls: Checking for calls for user", user.uid, "role:", userProfile?.role);

    // Listen for calls where receiverId is the current user and status is 'ringing'
    // Removed orderBy to avoid index requirements for now
    const q = query(
      collection(db, 'calls'),
      where('receiverId', '==', user.uid),
      where('status', '==', 'ringing')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("useIncomingCalls: Snapshot received", snapshot.size, "docs");
      if (!snapshot.empty) {
        const docData = snapshot.docs[0];
        console.log("useIncomingCalls: Incoming call found", docData.id);
        setIncomingCall({ ...docData.data(), id: docData.id } as Call);
      } else {
        setIncomingCall(null);
      }
    }, (error) => {
        console.error("useIncomingCalls: Error listening for calls", error);
    });

    return () => unsubscribe();
  }, [user, userProfile]);

  const acceptCall = async () => {
    if (!incomingCall) return;
    try {
      await updateDoc(doc(db, 'calls', incomingCall.id), {
        status: 'active'
      });
      router.push(`/call/${incomingCall.id}`);
    } catch (error) {
      console.error("Error accepting call", error);
    }
  };

  const rejectCall = async () => {
    if (!incomingCall) return;
    try {
      await updateDoc(doc(db, 'calls', incomingCall.id), {
        status: 'rejected'
      });
      setIncomingCall(null);
    } catch (error) {
       console.error("Error rejecting call", error);
    }
  };

  return { incomingCall, acceptCall, rejectCall };
}

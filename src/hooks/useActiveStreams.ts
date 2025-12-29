'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile } from '@/lib/db';

export interface ActiveStream {
  id: string; // The LiveKit room name
  creatorId: string;
  isActive: boolean;
  title: string;
  viewerCount: number;
  startedAt: any; // Using any to bypass complex Firestore Timestamp type issues for now
  creator?: UserProfile;
}

export function useActiveStreams() {
  const [streams, setStreams] = useState<ActiveStream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Query only active streams
    const q = query(
      collection(db, 'streams'),
      where('isActive', '==', true)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const activeStreams: ActiveStream[] = [];

      for (const streamDoc of snapshot.docs) {
        const data = streamDoc.data() as ActiveStream;
        
        // Fetch creator details
        try {
          const userDoc = await getDoc(doc(db, 'users', data.creatorId));
          if (userDoc.exists()) {
            data.creator = userDoc.data() as UserProfile;
          }
        } catch (e) {
          console.error(`Error fetching creator for stream ${data.id}`, e);
        }

        activeStreams.push(data);
      }

      setStreams(activeStreams);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { streams, loading };
}

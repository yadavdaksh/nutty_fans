'use client';

import { useState, useEffect } from 'react';
import { documentId, query, collection, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile } from '@/lib/db';

export function useUsersInfo(userIds: string[]) {
  const [users, setUsers] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userIds || userIds.length === 0) {
      // Don't set state synchronously
      return;
    }

    // De-duplicate IDs and filter empty
    const uniqueIds = Array.from(new Set(userIds)).filter(Boolean);
    if (uniqueIds.length === 0) return;

    setLoading(true);

    // Firestore 'in' query supports max 10 items. 
    // For simplicity, we'll chunk requests or just limit to top 10 for now.
    // In a production app with huge lists, we might need a different strategy.
    const chunks = [];
    for (let i = 0; i < uniqueIds.length; i += 10) {
      chunks.push(uniqueIds.slice(i, i + 10));
    }

    const unsubscribes = chunks.map(chunkIds => {
      const q = query(
        collection(db, 'users'),
        where(documentId(), 'in', chunkIds)
      );

      return onSnapshot(q, (snapshot) => {
        setUsers(prev => {
          const next = { ...prev };
          snapshot.docs.forEach(doc => {
            next[doc.id] = doc.data() as UserProfile;
          });
          return next;
        });
        setLoading(false);
      });
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(userIds)]);

  return { users, loading };
}

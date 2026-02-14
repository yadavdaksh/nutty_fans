'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Subscription, CreatorProfile, UserProfile } from '@/lib/db';

export interface SubscriptionWithCreator extends Subscription {
  creator: CreatorProfile;
  user: UserProfile;
}

export interface SubscriptionWithUser extends Subscription {
  user: UserProfile;
}

export function useSubscriptions(userId?: string, creatorId?: string) {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithCreator[]>([]);
  const [subscribers, setSubscribers] = useState<SubscriptionWithUser[]>([]);
  const [loading, setLoading] = useState(!!userId || !!creatorId);
  const [error, setError] = useState<string | null>(null);
  const [prevParams, setPrevParams] = useState({ userId, creatorId });

  // Sync state if parameters change
  if (userId !== prevParams.userId || creatorId !== prevParams.creatorId) {
    setPrevParams({ userId, creatorId });
    if (!userId && !creatorId) {
      setLoading(false);
      setSubscriptions([]);
      setSubscribers([]);
    } else {
      setLoading(true);
    }
  }

  useEffect(() => {
    if (!userId && !creatorId) return;

    let q;
    if (userId) {
      q = query(
        collection(db, 'subscriptions'),
        where('userId', '==', userId),
        where('status', 'in', ['active', 'expiring', 'cancelled'])
      );
    } else {
      q = query(
        collection(db, 'subscriptions'),
        where('creatorId', '==', creatorId),
        where('status', 'in', ['active', 'expiring', 'cancelled'])
      );
    }
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        if (userId) {
          const subsData: SubscriptionWithCreator[] = [];
          for (const subDoc of snapshot.docs) {
            const subData = { id: subDoc.id, ...subDoc.data() } as Subscription;
            const creatorDocRef = doc(db, 'creators', subData.creatorId);
            const creatorSnap = await getDoc(creatorDocRef);
            if (creatorSnap.exists()) {
              const creatorData = creatorSnap.data() as CreatorProfile;
              const userDocRef = doc(db, 'users', subData.creatorId);
              const userSnap = await getDoc(userDocRef);
              if (userSnap.exists()) {
                subsData.push({
                  ...subData,
                  creator: creatorData,
                  user: userSnap.data() as UserProfile
                });
              }
            }
          }

          setSubscriptions(subsData);
        } else if (creatorId) {
          const subsData: SubscriptionWithUser[] = [];
          for (const subDoc of snapshot.docs) {
            const subData = { id: subDoc.id, ...subDoc.data() } as Subscription;
            const userDocRef = doc(db, 'users', subData.userId);
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
              subsData.push({
                ...subData,
                user: userSnap.data() as UserProfile
              });
            }
          }
          
          setSubscribers(subsData);
        }
        setLoading(false);
      } catch (err: unknown) {
        console.error("Error fetching subscriptions:", err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        setLoading(false);
      }
    }, (err) => {
      console.error("Subscriptions snapshot error:", err);
      setError(err?.message || "Unknown error");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId, creatorId, loading]);

  return { subscriptions, subscribers, loading, error };
}

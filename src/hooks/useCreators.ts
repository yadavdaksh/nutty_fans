'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CreatorProfile, UserProfile } from '@/lib/db';

import { MOCK_CREATORS } from '@/lib/mockData';

export interface CreatorWithUser extends CreatorProfile {
  user: UserProfile;
}

export function useCreators() {
  const [creators, setCreators] = useState<CreatorWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'creators'));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const creatorsData: CreatorWithUser[] = [];
        
        for (const creatorDoc of snapshot.docs) {
          const creatorData = creatorDoc.data() as CreatorProfile;
          const userDocRef = doc(db, 'users', creatorData.userId);
          const userSnap = await getDoc(userDocRef);
          
          if (userSnap.exists()) {
            creatorsData.push({
              ...creatorData,
              user: userSnap.data() as UserProfile
            });
          }
        }
        
        // Merge with mock creators, avoiding duplicates if any
        const combinedCreators = [...creatorsData];
        MOCK_CREATORS.forEach(mock => {
          if (!combinedCreators.find(c => c.userId === mock.userId)) {
            combinedCreators.push(mock);
          }
        });

        setCreators(combinedCreators);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching creators:", err);
        setError(err.message);
        setLoading(false);
      }
    }, (err) => {
      console.error("Snapshot error:", err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { creators, loading, error };
}

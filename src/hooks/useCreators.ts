'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CreatorProfile, UserProfile, getUserProfile } from '@/lib/db';

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
        const creatorsWithUsers: CreatorWithUser[] = [];
        
        // Fetch all user profiles for these creators to check verification status
        const userPromises = snapshot.docs.map(creatorDoc => {
          const creatorData = creatorDoc.data() as CreatorProfile;
          return getUserProfile(creatorData.userId);
        });

        const userProfiles = await Promise.all(userPromises);

        snapshot.docs.forEach((creatorDoc, index) => {
          const creatorData = creatorDoc.data() as CreatorProfile;
          const userProfile = userProfiles[index];

          // FILTER: Only show creators who are 'approved'
          if (userProfile && userProfile.verificationStatus === 'approved') {
            creatorsWithUsers.push({
              ...creatorData,
              user: userProfile
            });
          }
        });
        
        setCreators(creatorsWithUsers);
        setLoading(false);
      } catch (err: unknown) {
        console.error("Error fetching creators:", err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        setLoading(false);
      }
    }, (err: unknown) => {
      console.error("Snapshot error:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { creators, loading, error };
}

'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Post, CreatorProfile, UserProfile } from '@/lib/db';

export interface FeedPost extends Post {
  creator: CreatorProfile;
  user: UserProfile;
}

export function useFeed() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const postsArray: FeedPost[] = [];

        // To avoid redundant reads, we'll fetch unique creators
        const creatorIds = Array.from(new Set(snapshot.docs.map(d => (d.data() as Post).creatorId)));
        const creatorProfiles: Record<string, { creator: CreatorProfile; user: UserProfile }> = {};

        await Promise.all(creatorIds.map(async (id) => {
          const creatorSnap = await getDoc(doc(db, 'creators', id));
          const userSnap = await getDoc(doc(db, 'users', id));
          
          if (creatorSnap.exists() && userSnap.exists()) {
            const userData = userSnap.data() as UserProfile;
            // FILTER: Only cache approved creators
            if (userData.verificationStatus === 'approved') {
              creatorProfiles[id] = {
                creator: creatorSnap.data() as CreatorProfile,
                user: userData
              };
            }
          }
        }));

        snapshot.docs.forEach((postDoc) => {
          const postData = { id: postDoc.id, ...postDoc.data() } as Post;
          const creatorInfo = creatorProfiles[postData.creatorId];

          if (creatorInfo) {
            postsArray.push({
              ...postData,
              creator: creatorInfo.creator,
              user: creatorInfo.user
            });
          }
        });
        
        // Sort by createdAt desc
        postsArray.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

        setPosts(postsArray);
        setLoading(false);
      } catch (err: unknown) {
        console.error("Error fetching feed:", err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        setLoading(false);
      }
    }, (err) => {
      console.error("Feed snapshot error:", err);
      setError(err?.message || "Unknown error");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { posts, loading, error };
}

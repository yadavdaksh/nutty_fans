'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Post, CreatorProfile, UserProfile } from '@/lib/db';

export interface FeedPost extends Post {
  creator: CreatorProfile;
  user: UserProfile;
}

import { MOCK_POSTS, MOCK_CREATORS } from '@/lib/mockData';

export function useFeed() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const feedPosts: FeedPost[] = [];
        
        for (const postDoc of snapshot.docs) {
          const postData = { id: postDoc.id, ...postDoc.data() } as Post;
          
          // Fetch creator profile
          const creatorDocRef = doc(db, 'creators', postData.creatorId);
          const creatorSnap = await getDoc(creatorDocRef);
          
          if (creatorSnap.exists()) {
            const creatorData = creatorSnap.data() as CreatorProfile;
            
            // Fetch user profile
            const userDocRef = doc(db, 'users', postData.creatorId);
            const userSnap = await getDoc(userDocRef);
            
            if (userSnap.exists()) {
              feedPosts.push({
                ...postData,
                creator: creatorData,
                user: userSnap.data() as UserProfile
              });
            }
          }
        }
        
        // Merge with mock posts
        const combinedFeed = [...feedPosts];
        MOCK_POSTS.forEach(mockPost => {
          if (!combinedFeed.find(p => p.id === mockPost.id)) {
            const mockCreator = MOCK_CREATORS.find(c => c.userId === mockPost.creatorId);
            if (mockCreator) {
              combinedFeed.push({
                ...mockPost,
                creator: mockCreator,
                user: mockCreator.user
              });
            }
          }
        });

        // Sort by createdAt desc
        combinedFeed.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

        setPosts(combinedFeed);
        setLoading(false);
      } catch (err: unknown) {
        console.error("Error fetching feed:", err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        setLoading(false);
      }
    }, (err) => {
      console.error("Feed snapshot error:", err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { posts, loading, error };
}

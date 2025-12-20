'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Post } from '@/lib/db';

import { MOCK_POSTS } from '@/lib/mockData';

export function usePosts(creatorId?: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let q;
    if (creatorId) {
      q = query(
        collection(db, 'posts'),
        where('creatorId', '==', creatorId),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const postsData: Post[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Post));
        
        // Filter mock posts for this creator specifically if ID is provided
        const relevantMocks = creatorId 
          ? MOCK_POSTS.filter(p => p.creatorId === creatorId)
          : MOCK_POSTS;

        // Merge and sort
        const combinedPosts = [...postsData];
        relevantMocks.forEach(mock => {
          if (!combinedPosts.find(p => p.id === mock.id)) {
            combinedPosts.push(mock);
          }
        });

        // Sort by createdAt descending
        combinedPosts.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

        setPosts(combinedPosts);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching posts:", err);
        setError(err.message);
        setLoading(false);
      }
    }, (err) => {
      console.error("Snapshot error:", err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [creatorId]);

  return { posts, loading, error };
}

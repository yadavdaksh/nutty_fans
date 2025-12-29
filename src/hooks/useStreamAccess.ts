'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db, Stream, checkSubscriptionStatus } from '@/lib/db';
import { collection, query, where, getDocs } from 'firebase/firestore';

export function useStreamAccess(stream: Stream | null) {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState<'public' | 'subscriber' | 'purchased' | 'creator' | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (!stream || !user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      // 1. Creator always has access
      if (user.uid === stream.creatorId) {
        setHasAccess(true);
        setReason('creator');
        setLoading(false);
        return;
      }

      // 2. Public streams
      if (stream.accessType === 'public') {
        setHasAccess(true);
        setReason('public');
        setLoading(false);
        return;
      }

      // 3. Subscriber only streams
      if (stream.accessType === 'subscribers') {
        const sub = await checkSubscriptionStatus(user.uid, stream.creatorId);
        if (sub) {
          setHasAccess(true);
          setReason('subscriber');
        } else {
          setHasAccess(false);
        }
        setLoading(false);
        return;
      }

      // 4. Paid streams
      if (stream.accessType === 'paid') {
        // For MVP, since we don't have the full transaction history implementation details yet,
        // we'll assume a 'stream_purchases' collection for direct verification
        const qDirect = query(
            collection(db, 'stream_purchases'),
            where('userId', '==', user.uid),
            where('streamId', '==', stream.id)
        );

        const snap = await getDocs(qDirect);
        
        if (!snap.empty) {
            setHasAccess(true);
            setReason('purchased');
        } else {
            setHasAccess(false);
        }
        setLoading(false);
        return;
      }

      setHasAccess(false);
      setLoading(false);
    };

    checkAccess();
  }, [stream, user]);

  return { hasAccess, loading, reason };
}

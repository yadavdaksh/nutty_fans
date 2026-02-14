'use client';

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc,
  writeBatch,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { db, Notification } from '../lib/db';
import { useAuth } from '../context/AuthContext';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.uid) {
      setTimeout(() => setLoading(false), 0);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const now = Date.now();
      const expiredIds: string[] = [];
      
      const msgs = snapshot.docs.map(doc => {
        const data = doc.data();
        const notification = {
          ...data,
          id: doc.id
        } as Notification;

        // Identify expired notifications for backend cleanup
        if (notification.expiresAt) {
          const expiryTime = notification.expiresAt instanceof Object && 'toMillis' in notification.expiresAt ? (notification.expiresAt as { toMillis: () => number }).toMillis() : 0;
          if (expiryTime < now) {
            expiredIds.push(notification.id);
          }
        }
        
        return notification;
      }).filter(n => !expiredIds.includes(n.id)) // Filter out identified expired ones
      .sort((a, b) => {
        const timeA = a.createdAt instanceof Object && 'toMillis' in a.createdAt ? (a.createdAt as { toMillis: () => number }).toMillis() : 0;
        const timeB = b.createdAt instanceof Object && 'toMillis' in b.createdAt ? (b.createdAt as { toMillis: () => number }).toMillis() : 0;
        return timeB - timeA;
      });
      
      // Backend Cleanup: Delete expired notifications from Firestore
      if (expiredIds.length > 0) {
        console.log('[DEBUG] Cleaning up expired notifications from backend:', expiredIds);
        const batch = writeBatch(db);
        expiredIds.forEach(id => {
          batch.delete(doc(db, 'notifications', id));
        });
        await batch.commit().catch(err => console.error("Error cleaning up notifications:", err));
      }

      setNotifications(msgs);
      setUnreadCount(msgs.filter(m => !m.isRead).length);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching notifications:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const markAsRead = async (notificationId: string) => {
    if (!user?.uid) return;
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        isRead: true
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const dismissNotification = async (notificationId: string) => {
    if (!user?.uid) return;
    try {
      // "Disappear immediately if interacted"
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (error) {
      console.error("Error dismissing notification:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.uid || unreadCount === 0) return;
    try {
      const batch = writeBatch(db);
      notifications.filter(n => !n.isRead).forEach(n => {
        batch.update(doc(db, 'notifications', n.id), { isRead: true });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    dismissNotification,
    markAllAsRead
  };
}

'use client';

import { useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { usePathname } from 'next/navigation';
import { Conversation } from '../lib/db';

export function useChatNotifications() {
  const { user } = useAuth();
  const pathname = usePathname();


  // Initialize audio - removed for now as we don't have the file
  // const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!user?.uid) return;

    // 1. Request Notification Permission
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Pre-load audio
    const notificationSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
    notificationSound.load();

    let isInitialLoad = true;

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // 2. Update Document Title
      const totalUnread = snapshot.docs.reduce((acc, doc) => {
        const data = doc.data() as Conversation;
        return acc + (data.unreadCount?.[user.uid] || 0);
      }, 0);

      if (typeof document !== 'undefined') {
        document.title = totalUnread > 0 ? `(${totalUnread}) NuttyFans` : 'NuttyFans';
      }

      if (isInitialLoad) {
        isInitialLoad = false;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          const data = change.doc.data() as Conversation;
          const myUnread = data.unreadCount?.[user.uid] || 0;
          
          if (myUnread > 0) {
             const senderId = data.participants.find(p => p !== user.uid);
             const senderMeta = senderId ? data.participantMetadata[senderId] : null;
             const senderName = senderMeta?.displayName || 'Someone';

             const params = new URLSearchParams(window.location.search);
             const activeChatId = params.get('chatId');

             if (pathname === '/messages' && activeChatId === data.id) {
               return; 
             }

             let toastMessage = data.lastMessage || 'Sent a message';
             const isImage = data.lastMessageType === 'image' || toastMessage.startsWith('https://firebasestorage.googleapis.com');
             if (isImage) toastMessage = 'Sent an image 📷';

             // 3. Play Notification Sound
             notificationSound.currentTime = 0;
             notificationSound.play().catch(e => {
               console.warn('[Notifications] Playback failed (likely autoplay policy):', e);
             });

             // 4. Show System Notification
             if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(senderName, { body: toastMessage, icon: '/favicon.ico' });
             }

             // 5. Show Toast
             toast(`${senderName}: ${toastMessage}`, {
                duration: 4000,
                position: 'top-right',
                icon: '💬',
                id: `msg-${data.id}` 
              });
          }
        }
      });
    });

    return () => {
      unsubscribe();
      if (typeof document !== 'undefined') document.title = 'NuttyFans';
    };
  }, [user?.uid, pathname]);
}

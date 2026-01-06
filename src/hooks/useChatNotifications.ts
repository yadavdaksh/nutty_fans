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

    // We only want to listen for *changes* after mount.
    // However, onSnapshot with 'includeMetadataChanges: false' (default) gives us initial state too.
    // We can filter out initial emissions by checking if we have loaded before or track the start time.
    
    let isInitialLoad = true;

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isInitialLoad) {
        isInitialLoad = false;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        
        if (change.type === 'modified') {
          const data = change.doc.data() as Conversation;
          
          const myUnread = data.unreadCount?.[user.uid] || 0;
          
          if (myUnread > 0) {
             // Identify sender
             const senderId = data.participants.find(p => p !== user.uid);
             const senderMeta = senderId ? data.participantMetadata[senderId] : null;
             const senderName = senderMeta?.displayName || 'Someone';

             const params = new URLSearchParams(window.location.search);
             const activeChatId = params.get('chatId');

             if (pathname === '/messages' && activeChatId === data.id) {
               return; 
             }

             // Format Message for Toast
             let toastMessage = data.lastMessage || 'Sent a message';
             const isImage = data.lastMessageType === 'image' || toastMessage.startsWith('https://firebasestorage.googleapis.com');
             
             if (isImage) {
               toastMessage = 'Sent an image 📷';
             }

             // Show Toast
             toast(`${senderName}: ${toastMessage}`, {
               duration: 4000,
               position: 'top-right',
               icon: '💬',
                style: {
                  background: '#fff',
                  color: '#333',
                  border: '1px solid #E5E7EB',
                },
                id: `msg-${data.id}-${data.lastMessage?.substring(0, 20)}` // Stable ID based on content
              });
          }
        }
      });
    });

    return () => unsubscribe();
  }, [user?.uid, pathname]);
}

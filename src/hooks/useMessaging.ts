'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, query, collection, where, orderBy, limit } from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';
import { db, rtdb } from '../lib/firebase';
import { Conversation, Message } from '../lib/db';

import { MOCK_CONVERSATIONS, MOCK_MESSAGES } from '../lib/mockData';

/**
 * Custom hook to handle real-time messaging state.
 * Manages the inbox list, active message history, and online/typing statuses.
 */
export function useMessaging(userId: string | undefined) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChatMessages, setActiveChatMessages] = useState<Message[]>([]);
  const [inboxLoading, setInboxLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});

  // 1. Listen to Inbox (Conversations where user is a participant)
  useEffect(() => {
    if (!userId) {
      setInboxLoading(false);
      return;
    }

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Conversation));

      // Merge with mock conversations
      const combinedConvs = [...convs];
      MOCK_CONVERSATIONS.forEach(mock => {
        if (!combinedConvs.find(c => c.id === mock.id)) {
          // Adjust participants to include current user
          const participants = mock.participants.map(p => p === 'current_user_id' ? userId : p);
          const participantMetadata = { ...mock.participantMetadata };
          if (participantMetadata['current_user_id']) {
            participantMetadata[userId] = participantMetadata['current_user_id'];
            delete participantMetadata['current_user_id'];
          }

          combinedConvs.push({
            ...mock,
            participants,
            participantMetadata
          });
        }
      });

      // Sort by updatedAt desc
      combinedConvs.sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis());

      setConversations(combinedConvs);
      setInboxLoading(false);
    }, (error) => {
      console.error("Inbox listener error:", error);
      setInboxLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  /**
   * Subscribes to message history for a specific chat.
   * Also listens to real-time typing indicators in RTDB.
   */
  const subscribeToMessages = (chatId: string) => {
    if (!chatId) return;
    
    setMessagesLoading(true);
    
    // Firestore: Live message history
    const qM = query(
      collection(db, 'conversations', chatId, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(100)
    );

    const unsubMessages = onSnapshot(qM, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Message));
      
      // If it's a mock conversation, inject mock messages
      let combinedMsgs = [...msgs];
      const isMockConv = MOCK_CONVERSATIONS.some(c => c.id === chatId);
      
      if (isMockConv) {
         MOCK_MESSAGES.forEach((mock, index) => {
           const id = `mock_msg_${index}`;
           if (!combinedMsgs.find(m => m.id === id)) {
             combinedMsgs.push({
               ...mock,
               id,
               senderId: mock.senderId === 'current_user_id' ? (userId || 'me') : mock.senderId
             });
           }
         });
      }

      // Sort by timestamp asc
      combinedMsgs.sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis());

      setActiveChatMessages(combinedMsgs);
      setMessagesLoading(false);
    });

    // RTDB: Typing indicators
    const typingRef = ref(rtdb, `typing/${chatId}`);
    const unsubTyping = onValue(typingRef, (snapshot) => {
      setTypingUsers(snapshot.val() || {});
    });

    // Return combined unsubscribe function
    return () => {
      unsubMessages();
      unsubTyping();
    };
  };

  /**
   * Listen to any user's online status in RTDB.
   */
  const subscribeToUserPresence = (targetUserId: string, callback: (status: any) => void) => {
    const statusRef = ref(rtdb, `/status/${targetUserId}`);
    return onValue(statusRef, (snapshot) => {
      callback(snapshot.val());
    });
  };

  return {
    conversations,
    activeChatMessages,
    inboxLoading,
    messagesLoading,
    typingUsers,
    subscribeToMessages,
    subscribeToUserPresence
  };
}

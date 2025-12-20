import { db, rtdb } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  getDoc,
  Timestamp,
  increment
} from 'firebase/firestore';
import { ref, set, onDisconnect, remove } from 'firebase/database';
import { Conversation, Message } from './db';
import { MOCK_CONVERSATIONS } from './mockData';

/**
 * Creates a unique conversation ID for two users by sorting their UIDs.
 * This ensures only one conversation document exists between any two users.
 */
export const getConversationId = (uid1: string, uid2: string) => {
  return [uid1, uid2].sort().join('_');
};

/**
 * Checks if a conversation exists between two users.
 */
export const checkConversationExists = async (uid1: string, uid2: string) => {
  // 1. Check Mock Data first (for demo purposes)
  const mockConv = MOCK_CONVERSATIONS.find(c => 
    c.participants.includes(uid1) && c.participants.includes(uid2)
  ) || MOCK_CONVERSATIONS.find(c => 
    c.participants.includes('current_user_id') && c.participants.includes(uid2)
  );
  
  if (mockConv) return mockConv;

  // 2. Check Firestore
  const convId = getConversationId(uid1, uid2);
  const convRef = doc(db, 'conversations', convId);
  const convSnap = await getDoc(convRef);
  return convSnap.exists() ? { id: convSnap.id, ...convSnap.data() } as Conversation : null;
};

/**
 * Starts a new conversation between a User and a Creator.
 * Validates roles before initialization.
 */
export const startConversation = async (
  userId: string, 
  userName: string, 
  userPhoto: string | undefined,
  creatorId: string,
  creatorName: string,
  creatorPhoto: string | undefined
) => {
  const convId = getConversationId(userId, creatorId);
  const convRef = doc(db, 'conversations', convId);
  
  const conversationData: Omit<Conversation, 'id'> = {
    participants: [userId, creatorId],
    participantMetadata: {
      [userId]: { displayName: userName, photoURL: userPhoto || '' },
      [creatorId]: { displayName: creatorName, photoURL: creatorPhoto || '' }
    },
    lastMessage: 'Conversation started',
    lastTimestamp: serverTimestamp(),
    unreadCount: {
      [userId]: 0,
      [creatorId]: 0
    },
    updatedAt: serverTimestamp()
  };

  await setDoc(convRef, conversationData, { merge: true });
  return convId;
};

/**
 * Sends a message in a conversation.
 * Updates the conversation metadata (lastMessage, updatedAt, unreadCount).
 */
export const sendMessage = async (
  conversationId: string, 
  senderId: string, 
  recipientId: string,
  text: string, 
  type: 'text' | 'image' | 'video' = 'text'
) => {
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  
  const messageData: Message = {
    senderId,
    text,
    type,
    timestamp: serverTimestamp(),
    read: false
  };
 
  const convRef = doc(db, 'conversations', conversationId);
  await ensureConversationRecord(conversationId, senderId, recipientId);

  // 1. Add message to sub-collection
  await addDoc(messagesRef, messageData);

  // 2. Update conversation metadata
  await updateDoc(convRef, {
    lastMessage: text,
    lastTimestamp: serverTimestamp(),
    updatedAt: serverTimestamp(),
    [`unreadCount.${recipientId}`]: increment(1)
  });
};

/**
 * Marks all messages in a conversation as read for the current user.
 */
export const markAsRead = async (conversationId: string, userId: string): Promise<void> => {
  const convRef = doc(db, 'conversations', conversationId);
  const convSnap = await getDoc(convRef);
  
  // If it's a mock or new chat, ensure it exists with metadata so it doesn't disappear from inbox
  if (!convSnap.exists() || !convSnap.data()?.participants) {
    // We try to find the recipient ID to pass to the helper
    const mock = MOCK_CONVERSATIONS.find(c => c.id === conversationId);
    const recipientId = mock?.participants.find(p => p !== 'current_user_id' && p !== userId) || 'unknown';
    await ensureConversationRecord(conversationId, userId, recipientId);
  }

  await updateDoc(convRef, {
    [`unreadCount.${userId}`]: 0
  });
};

/**
 * Ensures a conversation document exists with minimum required metadata.
 * Promotes mocks to real Firestore documents if needed.
 */
const ensureConversationRecord = async (conversationId: string, currentUserId: string, recipientId: string) => {
  const convRef = doc(db, 'conversations', conversationId);
  const convSnap = await getDoc(convRef);

  if (!convSnap.exists() || !convSnap.data()?.participants) {
    const mock = MOCK_CONVERSATIONS.find(c => c.id === conversationId);
    let participants = [currentUserId, recipientId];
    let participantMetadata = {};

    if (mock) {
      participants = mock.participants.map(p => p === 'current_user_id' ? currentUserId : p);
      participantMetadata = { ...mock.participantMetadata };
      if ((participantMetadata as any)['current_user_id']) {
        (participantMetadata as any)[currentUserId] = (participantMetadata as any)['current_user_id'];
        delete (participantMetadata as any)['current_user_id'];
      }
    }

    await setDoc(convRef, {
      participants,
      participantMetadata,
      updatedAt: serverTimestamp(),
      unreadCount: {
        [currentUserId]: 0,
        [recipientId]: 0
      }
    }, { merge: true });
  }
};

/**
 * Updates real-time presence in RTDB.
 */
export const setUserOnlineStatus = (userId: string) => {
  const statusRef = ref(rtdb, `/status/${userId}`);
  const connectedRef = ref(rtdb, '.info/connected');

  // Set to online when connected, and set a disconnect hook to flip status
  set(statusRef, { state: 'online', last_changed: Date.now() });
  onDisconnect(statusRef).set({ state: 'offline', last_changed: Date.now() });
};

/**
 * Sets typing status in RTDB.
 */
export const setTypingStatus = (conversationId: string, userId: string, isTyping: boolean) => {
  const typingRef = ref(rtdb, `typing/${conversationId}/${userId}`);
  
  if (isTyping) {
    set(typingRef, true);
    onDisconnect(typingRef).remove();
  } else {
    remove(typingRef);
  }
};

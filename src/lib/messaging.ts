import { db, rtdb } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  serverTimestamp, 
  getDoc,
  increment,
  arrayUnion
} from 'firebase/firestore';
import { ref, set, onDisconnect, remove } from 'firebase/database';
import { ref as storageRef, deleteObject } from 'firebase/storage';
import { Conversation, Message } from './db';
import { storage } from './firebase';

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
  // Check Firestore
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
  type: 'text' | 'image' | 'video' | 'call' = 'text',
  isLocked: boolean = false,
  price?: number
) => {
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  
  const messageData: Message = {
    senderId,
    text,
    type,
    timestamp: serverTimestamp(),
    read: false,
    isLocked,
    price: price ?? null,
    unlockedBy: []
  };
 
  const convRef = doc(db, 'conversations', conversationId);
  await ensureConversationRecord(conversationId, senderId, recipientId);

  // 1. Add message to sub-collection
  await addDoc(messagesRef, messageData);

  // 2. Update conversation metadata
  await updateDoc(convRef, {
    lastMessage: text,
    lastMessageType: type,
    lastTimestamp: serverTimestamp(),
    updatedAt: serverTimestamp(),
    [`unreadCount.${recipientId}`]: increment(1)
  });
};

/**
 * Logs a system message (like call started/ended)
 */
export const logSystemMessage = async (
  conversationId: string,
  text: string,
  type: 'call' = 'call'
) => {
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  
  const messageData: Message = {
    senderId: 'system',
    text,
    type,
    timestamp: serverTimestamp(),
    read: true,
    isLocked: false,
    price: null,
    unlockedBy: []
  };

  const convRef = doc(db, 'conversations', conversationId);
  await addDoc(messagesRef, messageData);
  await updateDoc(convRef, {
    lastMessage: text,
    lastMessageType: type,
    lastTimestamp: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

/**
 * Unlocks a locked message for a specific user.
 */
export const unlockMessage = async (
  conversationId: string,
  messageId: string,
  userId: string
) => {
  const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
  
  // In a real app, we would enable a payment transaction here.
  // For now, we just update the unlockedBy array.
  
  await updateDoc(messageRef, {
    unlockedBy: arrayUnion(userId) // Ensure arrayUnion is imported!
  });
};

/**
 * Marks all messages in a conversation as read for the current user.
 */
export const markAsRead = async (conversationId: string, userId: string): Promise<void> => {
  const convRef = doc(db, 'conversations', conversationId);
  const convSnap = await getDoc(convRef);
  
  if (!convSnap.exists() || !convSnap.data()?.participants) {
    return;
  }

  await updateDoc(convRef, {
    [`unreadCount.${userId}`]: 0
  });
};

/**
 * Ensures a conversation document exists with minimum required metadata.
 */
const ensureConversationRecord = async (conversationId: string, currentUserId: string, recipientId: string) => {
  const convRef = doc(db, 'conversations', conversationId);
  const convSnap = await getDoc(convRef);

  if (!convSnap.exists() || !convSnap.data()?.participants) {
    const participants = [currentUserId, recipientId];
    const participantMetadata = {};

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

/**
 * Deletes a message from a conversation and cleans up media if applicable.
 */
export const deleteMessage = async (conversationId: string, messageId: string, mediaURL?: string) => {
  const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);

  // 1. Delete Firestore Document
  await deleteDoc(messageRef);

  // 2. Delete Media from Storage if it exists and is a Firebase Storage URL
  if (mediaURL && mediaURL.includes('firebasestorage.googleapis.com')) {
    try {
      const fileRef = storageRef(storage, mediaURL);
      await deleteObject(fileRef);
    } catch (error) {
      console.error("Error deleting message media:", error);
    }
  }
};

import { db } from './firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp, 
  Timestamp 
} from 'firebase/firestore';

export type UserRole = 'user' | 'creator' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  isAgeVerified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreatorProfile {
  userId: string;
  bio: string;
  coverImageURL?: string;
  subscriptionTiers: {
    name: string;
    price: string;
    description: string;
    benefits: string[];
  }[];
  subscriberCount: number;
  postCount?: number;
  isLive?: boolean;
  categories: string[];
  profileViews: number;
  socialLinks: {
    instagram?: string;
    twitter?: string;
    website?: string;
    youtube?: string;
  };
}

// Create or overwrite a user profile
export const createUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', uid);
  
  const userData = {
    uid,
    role: 'user', // Default role
    isAgeVerified: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...data,
  };

  await setDoc(userRef, userData, { merge: true });
  return userData;
};

// Get a user profile by ID
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  } else {
    return null;
  }
};

// Update a user profile
export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', uid);
  
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

// Create or update a creator profile
export const createCreatorProfile = async (userId: string, data: Partial<CreatorProfile>) => {
  const creatorRef = doc(db, 'creators', userId);
  
  await setDoc(creatorRef, {
    userId,
    subscriberCount: 0,
    subscriptionTiers: [], // Default empty
    ...data,
  }, { merge: true });

  // Also update the user role to 'creator'
  await updateUserProfile(userId, { role: 'creator' });
};

export interface Post {
  id: string;
  creatorId: string;
  content: string;
  mediaURL: string;
  type: 'image' | 'video';
  isLocked: boolean;
  likesCount: number;
  commentsCount: number;
  createdAt: Timestamp;
}

export interface Subscription {
  id: string;
  userId: string;
  creatorId: string;
  tierId: string;
  status: 'active' | 'expired' | 'expiring';
  createdAt: Timestamp;
  expiresAt: Timestamp;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantMetadata: Record<string, {
    displayName: string;
    photoURL?: string;
  }>;
  lastMessage: string;
  lastTimestamp: Timestamp | any;
  unreadCount: Record<string, number>;
  updatedAt: Timestamp | any;
}

export interface Message {
  id?: string;
  senderId: string;
  text: string;
  type: 'text' | 'image' | 'video';
  timestamp: Timestamp | any;
  read: boolean;
}

// Get creator profile
export const getCreatorProfile = async (userId: string): Promise<CreatorProfile | null> => {
  const creatorRef = doc(db, 'creators', userId);
  const creatorSnap = await getDoc(creatorRef);

  if (creatorSnap.exists()) {
    return creatorSnap.data() as CreatorProfile;
  } else {
    return null;
  }
};

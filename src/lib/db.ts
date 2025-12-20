import { db } from './firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp, 
  Timestamp,
  runTransaction,
  collection,
  query,
  where,
  getDocs,
  limit,
  addDoc
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
  price: string;
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
  return creatorSnap.exists() ? creatorSnap.data() as CreatorProfile : null;
};

/**
 * Creates a subscription for a user to a creator.
 * Uses a transaction to ensure atomic updates to counts.
 */
export const createSubscription = async (
  userId: string,
  creatorId: string,
  tierId: string,
  price: string
) => {
  const subId = `${userId}_${creatorId}`;
  const subRef = doc(db, 'subscriptions', subId);
  const creatorRef = doc(db, 'creators', creatorId);

  await runTransaction(db, async (transaction) => {
    // 1. Get creator profile and check for existing sub
    const [creatorSnap, subSnap] = await Promise.all([
      transaction.get(creatorRef),
      transaction.get(subRef)
    ]);
    
    if (!creatorSnap.exists()) throw new Error("Creator not found");
    const isNewSubscription = !subSnap.exists();
    
    // 2. Create/Update subscription record
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    transaction.set(subRef, {
      id: subId,
      userId,
      creatorId,
      tierId,
      status: 'active',
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiresAt),
      price
    });

    // 3. Update creator stats only if new
    if (isNewSubscription) {
      transaction.update(creatorRef, {
        subscriberCount: (creatorSnap.data().subscriberCount || 0) + 1
      });
    }
  });

  return subId;
};

/**
 * Checks if a user is currently subscribed to a creator.
 */
export const checkSubscriptionStatus = async (userId: string, creatorId: string): Promise<Subscription | null> => {
  const subRef = doc(db, 'subscriptions', `${userId}_${creatorId}`);
  const subSnap = await getDoc(subRef);
  
  if (subSnap.exists()) {
    const data = subSnap.data() as Subscription;
    // Check if subscription is still valid
    if (data.status === 'active' && data.expiresAt.toDate() > new Date()) {
      return data;
    }
  }
  return null;
};

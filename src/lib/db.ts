import { db } from './firebase';
export { db };
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp, 
  Timestamp,
  runTransaction,
  collection,
  FieldValue,
  increment,
  DocumentReference,
  DocumentSnapshot,
  query,
  where,
  getDocs
} from 'firebase/firestore';

export interface Stream {
  id: string;
  creatorId: string;
  isActive: boolean;
  title: string;
  viewerCount: number;
  startedAt: Timestamp | FieldValue;
  accessType: 'public' | 'subscribers' | 'paid';
  price?: number;
}

export interface StreamPurchase {
  userId: string;
  creatorId: string;
  streamId: string;
  amount: number;
  purchasedAt: Timestamp;
}

export type UserRole = 'user' | 'creator' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  username?: string;
  location?: string;
  bio?: string;
  photoURL?: string;
  role: UserRole;
  isAgeVerified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreatorProfile {
  userId: string;
  bio: string;
  website?: string;
  coverImageURL?: string;
  subscriptionTiers: {
    name: string;
    price: string;
    description?: string;
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
  callPrices?: {
    audioPerMinute: number;
    videoPerMinute: number;
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
  appliedCoupon?: string | null;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantMetadata: Record<string, {
    displayName: string;
    photoURL?: string;
  }>;
  lastMessage?: string;
  lastTimestamp: Timestamp | FieldValue | null;
  unreadCount: Record<string, number>;
  updatedAt: Timestamp | FieldValue | null;
  lastMessageType?: 'text' | 'image' | 'video' | 'call';
}

export interface Message {
  id?: string;
  senderId: string;
  text: string;
  type: 'text' | 'image' | 'video' | 'call';
  timestamp: Timestamp | FieldValue | null;
  read: boolean;
  isLocked?: boolean;
  price?: number | null;
  unlockedBy?: string[];
}

export interface Coupon {
  id?: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiryDate: Timestamp | FieldValue | null;
  usageLimit: number;
  usageCount: number;
  status: 'active' | 'inactive';
  createdAt: Timestamp | FieldValue | null;
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
  price: string,
  couponCode?: string
) => {
  const subId = `${userId}_${creatorId}`;
  const subRef = doc(db, 'subscriptions', subId) as DocumentReference<Subscription>;
  const creatorRef = doc(db, 'creators', creatorId) as DocumentReference<CreatorProfile>;

  // 1. If couponCode provided, find the coupon document first
  let couponRef: DocumentReference<Coupon> | null = null;
  if (couponCode) {
    const q = query(collection(db, 'coupons'), where('code', '==', couponCode.toUpperCase()));
    const couponSnap = await getDocs(q);
    if (!couponSnap.empty) {
      couponRef = doc(db, 'coupons', couponSnap.docs[0].id) as DocumentReference<Coupon>;
    }
  }

  await runTransaction(db, async (transaction) => {
    // 2. Get creator profile, sub, and coupon (if provided)
    const gets: Promise<DocumentSnapshot<unknown>>[] = [
      transaction.get(creatorRef),
      transaction.get(subRef)
    ];
    if (couponRef) gets.push(transaction.get(couponRef));

    const snaps = await Promise.all(gets);
    const creatorSnap = snaps[0] as DocumentSnapshot<CreatorProfile>;
    const subSnap = snaps[1] as DocumentSnapshot<Subscription>;
    const couponSnap = couponRef ? snaps[2] as DocumentSnapshot<Coupon> : null;
    
    if (!creatorSnap.exists()) throw new Error("Creator not found");
    const isNewSubscription = !subSnap.exists();
    
    // 3. Create/Update subscription record
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
      price,
      appliedCoupon: couponCode || null
    });

    // 4. Update creator stats only if new
    if (isNewSubscription) {
      transaction.update(creatorRef, {
        subscriberCount: (creatorSnap.data()?.subscriberCount || 0) + 1
      });
    }

    // 5. Update coupon usage
    if (couponSnap && couponSnap.exists() && couponRef) {
      transaction.update(couponRef, {
        usageCount: (couponSnap.data()?.usageCount || 0) + 1
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

/**
 * Validates a coupon code.
 */
export const validateCoupon = async (code: string): Promise<Coupon | null> => {
  const q = query(
    collection(db, 'coupons'), 
    where('code', '==', code.toUpperCase()), 
    where('status', '==', 'active')
  );
  
  const snap = await getDocs(q);
  if (snap.empty) return null;
  
  const coupon = { id: snap.docs[0].id, ...snap.docs[0].data() } as Coupon;
  
  // Check Expiry
  if (coupon.expiryDate instanceof Timestamp && coupon.expiryDate.toDate() < new Date()) return null;
  
  // Check Usage Limit
  if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) return null;
  
  return coupon;
};

// Create a new post
export const createPost = async (postData: Omit<Post, 'id' | 'createdAt' | 'likesCount' | 'commentsCount'>) => {
  const postsRef = collection(db, 'posts');
  
  const newPost = {
    ...postData,
    likesCount: 0,
    commentsCount: 0,
    createdAt: serverTimestamp(),
  };

  await setDoc(doc(postsRef), newPost);
  
  // Update creator's post count
  const creatorRef = doc(db, 'creators', postData.creatorId);
  await updateDoc(creatorRef, {
    postCount: increment(1)
  });
  
  return newPost;
};

export interface Call {
  id: string;
  callerId: string;
  receiverId: string;
  type: 'audio' | 'video';
  status: 'ringing' | 'active' | 'ended' | 'rejected' | 'busy';
  startTime: Timestamp | FieldValue;
  endTime?: Timestamp | FieldValue;
  pricePerMinute: number;
  callerName?: string;
  callerPhotoURL?: string;
}

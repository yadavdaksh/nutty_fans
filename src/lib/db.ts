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
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

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
  emailVerified: boolean; // Added for strict auth
  onboardingCompleted: boolean; // Added for strict auth
  onboardingStep: number; // Added for strict auth
  walletBalance?: number;
  verificationStatus?: VerificationStatus;
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
    callPrices: {
      audioPerMinute: 1,
      videoPerMinute: 1,
    },
    ...data,
  }, { merge: true });

  // Only update verification status if it's not already set
  // This prevents resetting approved creators to 'pending' when they update settings
  const currentProfile = await getUserProfile(userId);
  if (currentProfile?.role !== 'creator' || !currentProfile?.verificationStatus) {
    await updateUserProfile(userId, { 
      role: 'creator',
      verificationStatus: 'pending' 
    });
  }
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
  status: 'active' | 'expired' | 'expiring' | 'cancelled';
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
 * Cancels a subscription immediately by setting status to 'cancelled'.
 */
export const cancelSubscription = async (subscriptionId: string) => {
  const subRef = doc(db, 'subscriptions', subscriptionId);
  await updateDoc(subRef, {
    status: 'cancelled',
    // We could also set expiresAt to now if we want immediate revocation, 
    // but typically we might want to keep it until the end of the period.
    // For this MVP, we just mark it cancelled.
  });
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

// Get feed for a user
export const getUserFeed = async (userId: string) => {
  // 1. Get user's subscriptions
  const subsRef = collection(db, 'subscriptions');
  const subsQ = query(
    subsRef,
    where('userId', '==', userId),
    where('status', 'in', ['active', 'expiring']) // active and expiring are valid
  );
  
  const subsSnap = await getDocs(subsQ);
  const subs = subsSnap.docs.map(doc => doc.data() as Subscription);
  const creatorIds = subs.map(s => s.creatorId);

  const postsRef = collection(db, 'posts');
  let postsQ;

  if (creatorIds.length > 0) {
    // Limited to 10 for 'in' query limitation in Firestore (MVP constraint)
    // We could chunk this or use a different strategy for production
    const validCreatorIds = creatorIds.slice(0, 10);
    postsQ = query(
      postsRef,
      where('creatorId', 'in', validCreatorIds),
      // orderBy requires an index on creatorId + createdAt. 
      // If index missing, it might error. For now, we fetch and sort in memory if needed,
      // but let's try ordering.
      // Firestore requires "Index needed" if we mix equality on creatorId and sort on createdAt.
      // We often can't do simple ORs. 
      // Safe bet for MVP: don't orderBy in query if using 'in', just fetch and sort in JS
      // unless we are sure about indexes.
    );
  } else {
    // Global Feed (Active creators/Recent posts)
    postsQ = query(
      postsRef,
      where('createdAt', '!=', null), // Ensure it exists
      // orderBy('createdAt', 'desc'), // This requires composite index usually
      // limit(20)
    );
  }

  const postsSnap = await getDocs(postsQ);
  
  // Map and sort in memory (safe for MVP sizes)
  const posts = postsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
  } as Post));

  // Sort by createdAt desc
  posts.sort((a, b) => {
     const tA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : Date.now();
     const tB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : Date.now();
     return tB - tA;
  });

  return {
    posts: posts.slice(0, 20), // Limit to 20
    isGlobal: creatorIds.length === 0
  };
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

export interface WalletTransaction {
  id?: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number; // in cents
  description: string;
  timestamp: Timestamp | FieldValue;
  metadata?: Record<string, unknown>;
}

export const getWalletBalance = async (userId: string): Promise<number> => {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return snap.data().walletBalance || 0;
  }
  return 0;
};

export const addFunds = async (userId: string, amount: number, paymentId: string, description: string = 'Wallet Recharge', metadata: Record<string, unknown> = {}) => {
  const userRef = doc(db, 'users', userId);
  const transactionRef = collection(db, 'wallet_transactions');

  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists()) {
      throw new Error("User does not exist!");
    }

    const newBalance = (userDoc.data().walletBalance || 0) + amount;
    
    transaction.update(userRef, { walletBalance: newBalance });
    
    // Add transaction record
    const newTxRef = doc(transactionRef);
    transaction.set(newTxRef, {
      userId,
      type: 'credit',
      amount,
      description,
      metadata: { ...metadata, paymentId },
      timestamp: serverTimestamp()
    });
  });
};

export const processTransaction = async (userId: string, amount: number, description: string, metadata: Record<string, unknown> = {}) => {
  const userRef = doc(db, 'users', userId);
  const txCollectionRef = collection(db, 'wallet_transactions');
  const creatorId = metadata?.creatorId as string | undefined;
  const creatorRef = creatorId ? doc(db, 'users', creatorId) : null;

  return await runTransaction(db, async (transaction) => {
     // 1. Perform ALL Reads first
     const userDoc = await transaction.get(userRef);
     const creatorDoc = creatorRef ? await transaction.get(creatorRef) : null;

     if (!userDoc.exists()) throw new Error("User not found");

     // 2. Logic Check
     const currentBalance = userDoc.data().walletBalance || 0;
     if (currentBalance < amount) {
        throw new Error("Insufficient funds");
     }

     // 3. Perform ALL Writes
     // Debit User
     const newBalance = currentBalance - amount;
     transaction.update(userRef, { walletBalance: newBalance });

     const newTxRef = doc(txCollectionRef);
     transaction.set(newTxRef, {
        userId,
        type: 'debit',
        amount,
        description,
        metadata,
        timestamp: serverTimestamp()
     });

     // 2. Credit Creator
     if (creatorDoc && creatorDoc.exists()) {
        const creatorBalance = creatorDoc.data().walletBalance || 0;

        transaction.update(creatorRef!, { walletBalance: creatorBalance + amount });

        const creditTxRef = doc(txCollectionRef);
        transaction.set(creditTxRef, {
           userId: creatorId,
           type: 'credit',
           amount,
           description: `Received: ${description}`,
           metadata: { ...metadata, senderId: userId },
           timestamp: serverTimestamp()
        });
     }
  });
};

export interface EarningsBreakdown {
  total: number;
  subscription: number;
  tip: number;
  message_unlock: number;
  post_unlock: number;
  call: number;
  video_call: number;
  other: number;
  [key: string]: number;
}

export const getEarningsBreakdown = async (userId: string): Promise<EarningsBreakdown> => {
  const txCollectionRef = collection(db, 'wallet_transactions');
  const q = query(
    txCollectionRef, 
    where('userId', '==', userId), 
    where('type', '==', 'credit')
  );

  const snapshot = await getDocs(q);
  const breakdown: EarningsBreakdown = {
    total: 0,
    subscription: 0,
    tip: 0,
    message_unlock: 0, // content_unlock
    post_unlock: 0,
    call: 0,
    video_call: 0,
    other: 0
  };

  snapshot.docs.forEach(doc => {
    const data = doc.data();
    const amount = data.amount || 0; // in cents
    const cat = data.metadata?.category;

    breakdown.total += amount;

    if (breakdown[cat] !== undefined) {
       breakdown[cat] += amount;
    } else {
       // Fallback for older transactions or different names
       if (data.description.toLowerCase().includes('tip')) breakdown.tip += amount;
       else if (data.description.toLowerCase().includes('subscription')) breakdown.subscription += amount;
       else if (data.description.toLowerCase().includes('unlock')) breakdown.message_unlock += amount; // Generic unlock
       else breakdown.other += amount;
    }
  });

  return breakdown;
};

import { Timestamp } from 'firebase/firestore';
import { CreatorProfile, UserProfile, Post, Subscription, Conversation, Message } from './db';

// Helper to create a fake Firestore timestamp
const createTimestamp = (daysAgo: number = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return Timestamp.fromDate(date);
};

export const MOCK_CREATORS: (CreatorProfile & { user: UserProfile })[] = [
  {
    userId: 'mock_sarah',
    bio: 'Fitness enthusiast & nutritionist. Join me for weekly workouts and healthy meal preps! 💪🥗',
    profileViews: 12500,
    subscriberCount: 1284,
    postCount: 45,
    isLive: true,
    categories: ['Fitness', 'Health', 'Lifestyle'],
    subscriptionTiers: [
      { name: 'Basic Fan', price: '9.99', description: 'Access to all photos', benefits: ['Daily workout photos', 'Nutrition tips'] },
      { name: 'VIP Athlete', price: '24.99', description: 'Exclusive video workouts', benefits: ['Live Q&A', 'Personalized meal plan'] }
    ],
    socialLinks: { instagram: 'sarah_fit', twitter: 'sarah_fit' },
    user: {
      uid: 'mock_sarah',
      email: 'sarah@example.com',
      displayName: 'Sarah Miller',
      photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
      role: 'creator',
      isAgeVerified: true,
      createdAt: createTimestamp(100),
      updatedAt: createTimestamp(0)
    }
  },
  {
    userId: 'mock_alex',
    bio: 'Digital artist & minimalist. Sharing my process and exclusive brushes. 🎨✨',
    profileViews: 8900,
    subscriberCount: 856,
    postCount: 120,
    isLive: false,
    categories: ['Art', 'Design'],
    subscriptionTiers: [
      { name: 'Supporter', price: '4.99', description: 'Support the art', benefits: ['WIP previews', 'Discord access'] },
      { name: 'Collector', price: '19.99', description: 'Full resolution art', benefits: ['Brush packs', 'HD Wallpapers'] }
    ],
    socialLinks: { instagram: 'alex_digital', twitter: 'alex_digital' },
    user: {
      uid: 'mock_alex',
      email: 'alex@example.com',
      displayName: 'Alex Rivers',
      photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      role: 'creator',
      isAgeVerified: true,
      createdAt: createTimestamp(150),
      updatedAt: createTimestamp(0)
    }
  },
  {
    userId: 'mock_maya',
    bio: 'Global traveler & nomad. Discover hidden gems and travel hacks with me! ✈️🌍',
    profileViews: 15400,
    subscriberCount: 2150,
    postCount: 88,
    isLive: false,
    categories: ['Travel', 'Photography'],
    subscriptionTiers: [
      { name: 'Backpacker', price: '7.99', description: 'Behind the scenes', benefits: ['Location tags', 'Packing lists'] },
      { name: 'First Class', price: '29.99', description: 'Full travel guides', benefits: ['1-on-1 calls', 'Custom itineraries'] }
    ],
    socialLinks: { instagram: 'maya_wanders', youtube: 'maya_wanders' },
    user: {
      uid: 'mock_maya',
      email: 'maya@example.com',
      displayName: 'Maya Chen',
      photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
      role: 'creator',
      isAgeVerified: true,
      createdAt: createTimestamp(200),
      updatedAt: createTimestamp(0)
    }
  }
];

export const MOCK_POSTS: Post[] = [
  {
    id: 'mp1',
    creatorId: 'mock_sarah',
    content: 'Morning workout complete! Today we focused on glutes and core. Full video available for VIP subscribers. #fitness #morningroutine',
    mediaURL: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
    type: 'image',
    isLocked: false,
    likesCount: 156,
    commentsCount: 24,
    createdAt: createTimestamp(1)
  },
  {
    id: 'mp2',
    creatorId: 'mock_alex',
    content: 'Just finished this new piece. The lighting took forever but I am so happy with how it turned out! #digitalart #landscape',
    mediaURL: 'https://images.unsplash.com/photo-1541462608141-ad4d059450c5?w=800&q=80',
    type: 'image',
    isLocked: true,
    likesCount: 432,
    commentsCount: 56,
    createdAt: createTimestamp(2)
  },
  {
    id: 'mp3',
    creatorId: 'mock_maya',
    content: 'Exploring the streets of Tokyo. This hidden ramen shop was incredible! 🍜 #tokyo #travel #japan',
    mediaURL: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80',
    type: 'image',
    isLocked: false,
    likesCount: 890,
    commentsCount: 112,
    createdAt: createTimestamp(0)
  },
  {
    id: 'mp4',
    creatorId: 'mock_sarah',
    content: 'Quick HIIT session for the busy ones! 🏃‍♀️💨 Follow along for a 15-min blast.',
    mediaURL: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    type: 'image',
    isLocked: false,
    likesCount: 245,
    commentsCount: 31,
    createdAt: createTimestamp(3)
  },
  {
    id: 'mp5',
    creatorId: 'mock_alex',
    content: 'Sketching session! Starting a new character design today. Who should I draw next?',
    mediaURL: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80',
    type: 'image',
    isLocked: false,
    likesCount: 672,
    commentsCount: 89,
    createdAt: createTimestamp(4)
  },
  {
    id: 'mp6',
    creatorId: 'mock_maya',
    content: 'Sunset over the Santorini cliffs. This view never gets old. 🌅✨ #santorini #greece #sunset',
    mediaURL: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80',
    type: 'image',
    isLocked: true,
    likesCount: 1240,
    commentsCount: 45,
    createdAt: createTimestamp(5)
  },
  {
    id: 'mp7',
    creatorId: 'mock_sarah',
    content: 'Meal prep Sunday! Here is what is on the menu this week. Healthy, easy, and delicious. 🥗🍤',
    mediaURL: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80',
    type: 'image',
    isLocked: true,
    likesCount: 312,
    commentsCount: 67,
    createdAt: createTimestamp(6)
  },
  {
    id: 'mp8',
    creatorId: 'mock_alex',
    content: 'Final render vs initial sketch. Swipe to see the process! ➡️🎨',
    mediaURL: 'https://images.unsplash.com/photo-1561715276-a2d087060f1d?w=800&q=80',
    type: 'image',
    isLocked: true,
    likesCount: 1540,
    commentsCount: 128,
    createdAt: createTimestamp(7)
  }
];

export const MOCK_SUBSCRIPTIONS: (Subscription & { user: UserProfile; creator: CreatorProfile })[] = [
  {
    id: 'ms1',
    userId: 'current_user_id', // placeholder
    creatorId: 'mock_sarah',
    tierId: 'VIP Athlete',
    status: 'active',
    createdAt: createTimestamp(15),
    expiresAt: createTimestamp(-15),
    price: '49.99',
    user: MOCK_CREATORS[0].user,
    creator: MOCK_CREATORS[0]
  },
  {
    id: 'ms2',
    userId: 'current_user_id', // placeholder
    creatorId: 'mock_alex',
    tierId: 'Collector',
    status: 'active',
    createdAt: createTimestamp(30),
    expiresAt: createTimestamp(-30),
    price: '19.99',
    user: MOCK_CREATORS[1].user,
    creator: MOCK_CREATORS[1]
  }
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'mc1',
    participants: ['current_user_id', 'mock_sarah'],
    participantMetadata: {
      'current_user_id': { displayName: 'You', photoURL: '' },
      'mock_sarah': { displayName: 'Sarah Miller', photoURL: MOCK_CREATORS[0].user.photoURL }
    },
    lastMessage: 'Thanks for the workout tips!',
    lastTimestamp: createTimestamp(0),
    unreadCount: { 'current_user_id': 0, 'mock_sarah': 0 },
    updatedAt: createTimestamp(0)
  },
  {
    id: 'mc2',
    participants: ['current_user_id', 'mock_alex'],
    participantMetadata: {
      'current_user_id': { displayName: 'You', photoURL: '' },
      'mock_alex': { displayName: 'Alex Rivers', photoURL: MOCK_CREATORS[1].user.photoURL }
    },
    lastMessage: 'Do you have custom brushes?',
    lastTimestamp: createTimestamp(1),
    unreadCount: { 'current_user_id': 1, 'mock_alex': 0 },
    updatedAt: createTimestamp(1)
  }
];

export const MOCK_MESSAGES: Message[] = [
  {
    senderId: 'mock_alex',
    text: 'Hey! I just released a new set of brushes.',
    type: 'text',
    timestamp: createTimestamp(1),
    read: false
  },
  {
    senderId: 'current_user_id',
    text: 'That is awesome, checking them out now!',
    type: 'text',
    timestamp: createTimestamp(0.9),
    read: true
  }
];

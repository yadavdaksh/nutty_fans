# NuttyFans Platform

A modern subscription-based content platform for creators and fans, built with Next.js and Firebase.

## 🚀 Tech Stack

- **Framework**: Next.js 16.0.7 (App Router)
- **Language**: TypeScript
- **UI**: React 19.2.0, Tailwind CSS v4
- **Backend**: Firebase (Authentication, Firestore, Storage, Realtime Database)
- **Forms**: react-hook-form
- **Icons**: lucide-react
- **Font**: Inter (Google Fonts)

## 📋 Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Firebase project with Authentication, Firestore, Storage, and Realtime Database enabled
- Firebase configuration credentials

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd nutty-fans
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
```

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```bash
npm run build
npm start
```

## 📄 Pages & Routes

### Public Routes

#### `/` - Home Page

- **Description**: Landing page showcasing the platform
- **Features**:
  - Hero section with call-to-action
  - Platform statistics (Active Creators, Paid Out, Monthly Growth, Avg Rating)
  - Top Creators grid
  - Creator Success Stories testimonials
  - Final CTA section
- **Access**: Public (no authentication required)

#### `/login` - Login Page

- **Description**: User authentication page
- **Features**:
  - Email and password login form
  - Form validation using react-hook-form
  - Error handling for invalid credentials
  - Link to signup page
  - Redirects to home page after successful login
- **Access**: Public (redirects to dashboard if already logged in)

#### `/signup` - Signup Page

- **Description**: New user registration page
- **Features**:
  - Name, email, and password registration form
  - Password confirmation validation
  - Form validation using react-hook-form
  - Creates Firebase user account
  - Redirects to OTP verification after successful signup
- **Access**: Public (redirects to dashboard if already logged in)

### Authentication Flow Routes

#### `/verify-otp` - OTP Verification Page

- **Description**: Email OTP verification step
- **Features**:
  - 6-digit OTP input fields
  - Auto-focus navigation between fields
  - Resend OTP functionality with countdown timer
  - Redirects to age verification after successful OTP verification
- **Access**: Protected (requires authentication)

#### `/verify-age` - Age Verification Page

- **Description**: Age verification step
- **Features**:
  - Date of birth selector (Month, Day, Year)
  - Age validation (must be 18+)
  - Creates user profile in Firestore
  - Marks user as age verified
  - Redirects to dashboard after successful verification
- **Access**: Protected (requires authentication)

### Protected Routes (Require Authentication)

#### `/dashboard` - Creator Dashboard

- **Description**: Main dashboard for creators
- **Features**:
  - Sidebar navigation with menu items
  - Statistics cards:
    - Total Earnings (with growth percentage)
    - Subscribers (with growth percentage)
    - Total Views (with growth percentage)
    - Engagement Rate (with growth percentage)
  - Revenue Overview section with monthly progress bars
  - Quick Actions panel:
    - Upload Content
    - Schedule Post
    - Message Subscribers
    - View Analytics
  - Recent Subscribers list with tier badges
  - Monthly Goal Progress tracker
  - "Upload New Post" button
- **Access**: Protected (requires creator role)
- **Note**: Non-creators see a message to become a creator

#### `/messages` - Messages & Chat
- **Description**: Real-time messaging platform
- **Features**:
  - Direct messaging between fans and creators
  - Real-time typing indicators (via RTDB)
  - User online/offline presence tracking (via RTDB)
  - Unread message counters
  - Optimized for mobile and desktop

#### `/discover` - Discover Page
- **Description**: Find and browse creators
- **Features**:
  - Dynamic creator grid with real-time stats
  - Merged sample data for a "lived-in" experience
  - Category filtering (Fitness, Art, etc.)

#### `/live` - Live Streams
- **Description**: Browse creators who are currently live
- **Features**:
  - Real-time filtering for `isLive` creators
  - Empty states with sample creators

#### `/subscription` - Subscription Management
- **Description**: Manage active subscriptions
- **Features**:
  - List of all active/expired subscriptions
  - Monthly spend tracking analytics
  - Easy navigation back to creator profiles

#### `/settings` - Settings Page

- **Description**: User account settings
- **Features**:
  - Tabbed interface with 6 tabs:
    - **Profile**: Profile picture upload, username, display name, email, website, location, bio
    - **Account**: Account settings (placeholder)
    - **Notifications**: Notification preferences (placeholder)
    - **Privacy**: Privacy settings (placeholder)
    - **Billing**: Billing information (placeholder)
    - **Plans**: Subscription plans (placeholder)
  - Form validation
  - Save/Cancel buttons
  - Gradient background matching design system
- **Access**: Protected (requires authentication)

#### `/profile` - Profile Page

- **Description**: Creator profile page
- **Features**:
  - Gradient banner at the top
  - Profile card with:
    - Avatar with border
    - Name with verification badge
    - Username
    - Subscriber and post counts
    - Category badge
    - Subscribe, Message, and Tip buttons
  - Bio section
  - Subscription Tiers section:
    - Basic ($9.99/month)
    - Premium ($19.99/month) - marked as "POPULAR"
    - VIP ($49.99/month)
    - Each tier shows features and pricing
  - Content tabs (Posts, Videos, Photos)
  - Content grid with locked/unlocked states
- **Access**: Protected (requires authentication)

- `/notifications` - Notifications page
- `/content/upload` - Content upload page
- `/content/schedule` - Schedule posts page
- `/analytics` - Analytics page
- `/subscribers` - Subscribers list page

## 🔐 Authentication Flow

### Sign Up Flow

1. User visits `/signup`
2. Fills in name, email, and password
3. Submits form → Creates Firebase user account
4. Redirects to `/verify-otp`
5. User enters 6-digit OTP code
6. After OTP verification → Redirects to `/verify-age`
7. User selects date of birth
8. Age verification (must be 18+)
9. Creates user profile in Firestore with `isAgeVerified: true`
10. Redirects to `/dashboard`

### Login Flow

1. User visits `/login`
2. Enters email and password
3. Submits form → Authenticates with Firebase
4. Redirects to `/` (home page)

### Sign Out

1. Click profile icon in header
2. Select "Sign Out" from dropdown
3. Clears session and redirects to home page

## 🎨 Design System

### Colors

- **Primary Gradient**: `from-[#9810fa] to-[#e60076]` (Purple to Pink)
- **Text Colors**:
  - Primary: `#101828`
  - Secondary: `#4a5565`
  - Tertiary: `#364153`
- **Background**: `#f9fafb` (light gray)
- **Borders**: `#e5e7eb`

### Typography

- **Font Family**: Inter (Google Fonts)
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold)
- **Font Sizes**: Various sizes from 12px to 36px

### Components

- **Header**: Fixed at top (65px height) with logo, navigation, search, notifications, and profile dropdown
- **Footer**: Multi-column footer with platform links, resources, legal links, and social media icons
- **Sidebar**: Fixed left sidebar (276px width) for dashboard pages with navigation items
- **ProtectedRoute**: Wrapper component that redirects unauthenticated users to login

## 📁 Project Structure

```
nutty-fans/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/          # Creator dashboard
│   │   ├── login/              # Login page
│   │   ├── signup/             # Signup page
│   │   ├── verify-otp/         # OTP verification
│   │   ├── verify-age/          # Age verification
│   │   ├── settings/            # Settings page
│   │   ├── profile/             # Profile page
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page
│   │   └── globals.css          # Global styles
│   ├── components/              # React components
│   │   ├── Header.tsx           # Site header
│   │   ├── Footer.tsx           # Site footer
│   │   ├── Sidebar.tsx          # Dashboard sidebar
│   │   └── ProtectedRoute.tsx  # Route protection
│   ├── context/                 # React contexts
│   │   └── AuthContext.tsx     # Authentication context
│   ├── lib/                     # Utility functions
│   │   ├── firebase.ts         # Firebase initialization
│   │   └── db.ts               # Firestore operations
│   └── middleware.ts            # Next.js middleware
├── public/                      # Static assets
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── next.config.ts               # Next.js config
├── postcss.config.mjs           # PostCSS config
└── README.md                    # This file
```

## 🔧 Key Features

### Authentication

- ✅ Email/password authentication
- ✅ OTP email verification
- ✅ Age verification (18+)
- ✅ Protected routes
- ✅ Session management with cookies
- ✅ Google sign-in support (configured but not fully implemented)

### User Profiles

- ✅ User profile creation
- ✅ Creator profile creation
- ✅ Profile viewing and editing
- ✅ Profile image upload (UI ready, backend integration needed)

### Dashboard & Data
- ✅ Dynamic feed with Firestore & Mock data integration
- ✅ Live creator indicators
- ✅ Creator dashboard with real-time statistics
- ✅ Automated revenue estimation based on subscribers
- ✅ Recent subscribers activity list
- ✅ Monthly goal tracking (automated)

### Settings

- ✅ Profile settings with form
- ✅ Tabbed interface for different settings categories
- ✅ Form validation

### Profile Page

- ✅ Creator profile display
- ✅ Subscription tiers showcase
- ✅ Content grid with locked/unlocked states

### UserProfile (Firestore)
```typescript
{
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'user' | 'creator';
  isAgeVerified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### CreatorProfile (Firestore)
```typescript
{
  userId: string;
  bio?: string;
  categories?: string[];
  subscriptionTiers: Array<{
    name: string;
    price: string;
    description?: string;
    benefits: string[];
  }>;
  subscriberCount?: number;
  postCount?: number;
  profileViews?: number;
  isLive?: boolean;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
  };
}
```

### Post (Firestore)
```typescript
{
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
```

### Subscription (Firestore)
```typescript
{
  id: string;
  userId: string;
  creatorId: string;
  tierId: string;
  status: 'active' | 'expired' | 'expiring';
  createdAt: Timestamp;
  expiresAt: Timestamp;
}
```

### Conversation (Firestore)
```typescript
{
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
```

## 🚦 Route Protection

The application uses middleware and `ProtectedRoute` component to protect routes:

- **Protected Routes**: `/dashboard`, `/verify-otp`, `/verify-age`, `/onboarding`, `/profile`, `/messages`, `/content`, `/settings`
- **Auth Routes**: `/login`, `/signup` (redirect to dashboard if already logged in)
- **Public Routes**: `/` (home page)

## 📝 Development Notes

### Adding New Pages

1. Create a new folder in `src/app/`
2. Add `page.tsx` file
3. Use `ProtectedRoute` wrapper if authentication is required
4. Add route to middleware if needed

### Styling Guidelines

- Use Tailwind CSS classes
- Follow the design system colors and typography
- Use Inter font family explicitly: `style={{ fontFamily: 'Inter, sans-serif' }}`
- Match Figma designs for spacing and sizing

### Firebase Integration

- Firebase is initialized in `src/lib/firebase.ts`
- Firestore operations are in `src/lib/db.ts`
- Authentication context is in `src/context/AuthContext.tsx`

## 🐛 Known Issues / TODO

- [✅] Add messaging system
- [ ] Complete Google sign-in implementation
- [ ] Implement profile image upload to Firebase Storage
- [ ] Implement content upload functionality (backend)
- [ ] Implement subscription payment processing (Stripe integration)
- [ ] Add analytics charts (Recharts)
- [ ] Complete settings tabs (Account, Notifications, Privacy, Billing, Plans)

## 🧪 Development Fallbacks (Sample Data)

To ensure a rich development and demonstration experience even with an empty database, the platform includes a robust sample data system:

- **Location**: `src/lib/mockData.ts`
- **Mechanism**: Custom hooks (`useCreators`, `usePosts`, `useFeed`, `useSubscriptions`, `useMessaging`) automatically merge real Firestore/RTDB data with high-quality mock objects.
- **Benefits**: Immediate visibility of UI states, "lived-in" content for demos, and fallback content when backend data is missing.

## 📞 Support

For issues or questions, please refer to the project documentation or contact the development team.

## 📄 License

This project is private and proprietary.

---

**Last Updated**: December 2025

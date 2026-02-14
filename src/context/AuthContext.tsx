'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { UserProfile, getUserProfile } from '@/lib/db';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    try {
      const profile = await getUserProfile(uid);
      setUserProfile(profile);
      
      // Set cookies for middleware
      if (profile?.role === 'admin') {
        Cookies.set('is_admin', 'true', { expires: 7 });
      } else {
        Cookies.remove('is_admin');
      }

      if (profile?.onboardingCompleted) {
        Cookies.set('onboarding_completed', 'true', { expires: 7 });
        Cookies.set('user_role', profile.role, { expires: 7 });
      } else {
        Cookies.remove('onboarding_completed');
        Cookies.remove('user_role');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Set info for middleware with explicit path and sameSite
        Cookies.set('session_token', await user.getIdToken(), { 
          expires: 7, 
          path: '/',
          sameSite: 'Lax',
          secure: true
        }); 
        await fetchProfile(user.uid);
      } else {
        Cookies.remove('session_token', { path: '/' });
        Cookies.remove('is_admin', { path: '/' });
        Cookies.remove('onboarding_completed', { path: '/' });
        Cookies.remove('user_role', { path: '/' });
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid);
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      Cookies.remove('session_token');
      setUserProfile(null);
    } catch (error) {
      console.error('Error signing out', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signInWithGoogle, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

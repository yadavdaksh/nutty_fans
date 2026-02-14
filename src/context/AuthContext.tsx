'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { UserProfile } from '@/lib/db';
import { doc, onSnapshot } from 'firebase/firestore';
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

  // Removed fetchProfile in favor of onSnapshot listener

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;

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

        // Start real-time listener for profile
        const profileRef = doc(db, 'users', user.uid);
        unsubProfile = onSnapshot(profileRef, (snap) => {
          if (snap.exists()) {
            const profile = snap.data() as UserProfile;
            setUserProfile(profile);

            // Sync cookies
            if (profile.role === 'admin') {
              Cookies.set('is_admin', 'true', { expires: 7 });
            } else {
              Cookies.remove('is_admin');
            }

            if (profile.onboardingCompleted) {
              Cookies.set('onboarding_completed', 'true', { expires: 7 });
              Cookies.set('user_role', profile.role, { expires: 7 });
            } else {
              Cookies.remove('onboarding_completed');
              Cookies.remove('user_role');
            }
          } else {
            setUserProfile(null);
            Cookies.remove('is_admin');
            Cookies.remove('onboarding_completed');
            Cookies.remove('user_role');
          }
        }, (error) => {
          console.error('Error in profile listener:', error);
        });

      } else {
        Cookies.remove('session_token', { path: '/' });
        Cookies.remove('is_admin', { path: '/' });
        Cookies.remove('onboarding_completed', { path: '/' });
        Cookies.remove('user_role', { path: '/' });
        setUserProfile(null);
        if (unsubProfile) unsubProfile();
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const refreshProfile = async () => {
    // refreshProfile is now mostly legacy as we have a real-time listener,
    // but we can keep the interface for compatibility.
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

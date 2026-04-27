import { useEffect, useState, useCallback } from 'react';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { db, auth, googleProvider } from '../firebase';

export interface UserProgress {
  gold: number;
  maxLevel: number;
  highScoreEndless: number;
  dailyScore: Record<string, number>;
}

export function useFirebase() {
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setUserId(firebaseUser.uid);
      } else {
        // Fallback to local guest ID
        let id = localStorage.getItem('numstrata_user_id');
        if (!id) {
          id = 'guest_' + Math.random().toString(36).substring(2, 9);
          localStorage.setItem('numstrata_user_id', id);
        }
        setUserId(id);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch or initialize progress when userId changes
  useEffect(() => {
    if (!userId) return;

    const fetchProgress = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProgress(docSnap.data() as UserProgress);
        } else {
          const initData: UserProgress = {
            gold: 100,
            maxLevel: 0,
            highScoreEndless: 0,
            dailyScore: {},
          };
          await setDoc(docRef, initData);
          setProgress(initData);
        }
        console.log(`🔥 [Firebase] Connected as ${user ? 'User' : 'Guest'}: ${userId}`);
      } catch (e) {
        console.error("Error fetching progress:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [userId, user]);

  const updateProgress = useCallback(async (updates: Partial<UserProgress>) => {
    if (!userId) return;
    try {
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, updates);
      setProgress(prev => prev ? { ...prev, ...updates } : null);
    } catch (e) {
      console.error("Error updating progress:", e);
    }
  }, [userId]);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error("Login failed:", e);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  return { 
    user,
    userId, 
    progress, 
    loading, 
    updateProgress,
    loginWithGoogle,
    logout
  };
}

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useRouter } from 'next/navigation';
import type { User } from '../types/user';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({
            id: firebaseUser.uid,
            uid: firebaseUser.uid, // Add uid to match our User type
            email: firebaseUser.email || '',
            name: userDoc.data().name, // Add name from Firestore
            type: userDoc.data().role,
            phoneNumber: userDoc.data().phoneNumber,
            createdAt: userDoc.data().createdAt.toDate(),
          });
        }
      } else {
        setUser(null);
        router.push('/signup'); // Changed from /auth to /signup
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
};
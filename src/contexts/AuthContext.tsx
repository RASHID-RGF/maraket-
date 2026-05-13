import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { User } from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  serverTimestamp 
} from "firebase/firestore";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  updateProfile,
  onAuthStateChanged,
  sendEmailVerification
} from "firebase/auth";
import { auth, db } from "@/integrations/firebase/client";

export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  balance_kes: number;
}

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  deposit: (amount: number) => Promise<{ error: Error | null }>;
  // M-Pesa STK push is performed from the deposit route.

  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileUnsub, setProfileUnsub] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (!auth || !db) {
      // Firebase not configured; keep app usable.
      setLoading(false);
      setUser(null);
      setProfile(null);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Immediate optimistic profile
        setProfile({
          id: firebaseUser.uid,
          username:
            firebaseUser.displayName?.toLowerCase().replace(/ /g, "") || null,
          display_name: firebaseUser.displayName || "User",
          avatar_url: firebaseUser.photoURL || null,
          balance_kes: 0,
        });

        setLoading(false);

        // Realtime listener + profile fetch
        const unsubProfile = onSnapshot(
          doc(db, "profiles", firebaseUser.uid),
          async (snap) => {
            if (snap.exists()) {
              const data = snap.data() as Omit<Profile, "id">;
              setProfile({
                id: firebaseUser.uid,
                ...data,
                avatar_url: data.avatar_url || firebaseUser.photoURL || null,
              });
            }
          }
        );
        setProfileUnsub(() => unsubProfile);
      } else {
        setProfile(null);
        setLoading(false);
        if (profileUnsub) {
          profileUnsub();
          setProfileUnsub(null);
        }
      }
    });

    return unsub;
  }, []);


  const fetchProfile = async (userId: string) => {
    const snap = await getDoc(doc(db, 'profiles', userId));
    if (snap.exists()) {
      const data = snap.data() as Omit<Profile, 'id'>;
      const p: Profile = { id: userId, ...data };
      setProfile(p);
      return p;
    }
    return null;
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      await updateProfile(firebaseUser, { displayName });

        // Create profile with 0 balance (no starter credits)
        await setDoc(doc(db, 'profiles', firebaseUser.uid), {
          username: displayName.toLowerCase().replace(/ /g, ''),
          display_name: displayName,
          avatar_url: null,
          balance_kes: 0,
          updated_at: serverTimestamp(),
        });

      await sendEmailVerification(firebaseUser);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOutUser = async () => {
    await signOut(auth);
  };

  const deposit = async (amount: number) => {
    // Front-end deposit flow uses M-Pesa STK push and then should credit wallet
    // only after server confirmation (callback). For now we keep this as a
    // no-op placeholder to avoid double-crediting and to make UI compile.
    if (!user || !profile || amount < 10) {
      return { error: new Error("Invalid user or amount < 10 KSh") };
    }

    // If you later add callback endpoints, this function can be updated
    // to call your backend to validate/credit the payment.
    return { error: null };
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid);
    }
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        profile, 
        loading, 
        signIn, 
        signUp, 
        signInWithGoogle, 
        deposit,
        signOut: signOutUser, 
        refreshProfile 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

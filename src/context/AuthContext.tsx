import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/config/firebase";
import type { AppUser, UserRole } from "@/types/auth";

// ─── Context shape ───────────────────────────────────────────────────────────

interface AuthContextValue {
  /** Raw Firebase Auth user (null = signed out) */
  firebaseUser: User | null;
  /** Enriched user with role from Firestore (null = signed out or loading) */
  appUser: AppUser | null;
  /** Role shortcut — undefined while loading */
  role: UserRole | undefined;
  /** True while auth state / Firestore doc is being resolved */
  loading: boolean;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (!user) {
        setAppUser(null);
        setLoading(false);
        return;
      }

      // Fetch the user's Firestore document to get their role
      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const data = snap.data();
          setAppUser({
            uid: user.uid,
            email: data.email ?? user.email ?? "",
            displayName: data.displayName ?? user.displayName ?? "User",
            role: data.role as UserRole,
            createdAt: data.createdAt?.toDate?.() ?? new Date(),
          });
        } else {
          // No Firestore doc — auto-create one (bootstrap: first account = manager)
          const defaultRole: UserRole = "manager";
          const defaultName = user.displayName ?? user.email?.split("@")[0] ?? "Manager";
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email ?? "",
            displayName: defaultName,
            role: defaultRole,
            createdAt: serverTimestamp(),
          });
          setAppUser({
            uid: user.uid,
            email: user.email ?? "",
            displayName: defaultName,
            role: defaultRole,
            createdAt: new Date(),
          });
        }
      } catch (err) {
        console.error("Failed to fetch/create user document:", err);
        setAppUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signOutUser = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        appUser,
        role: appUser?.role,
        loading,
        signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}

import { useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/config/firebase";
import type { AppUser, UserRole } from "@/types/auth";
import { AuthContext } from "@/context/authContext";

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
          setLoading(false);
        } else {
          // No Firestore document — this user has been deleted.
          // Force sign-out and keep loading=true; the resulting null
          // auth-state event will set loading(false) and redirect to /login.
          await signOut(auth);
        }
      } catch (err) {
        console.error("Failed to fetch user document:", err);
        setAppUser(null);
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

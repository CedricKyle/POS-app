import { createContext } from "react";
import type { User } from "firebase/auth";
import type { AppUser, UserRole } from "@/types/auth";

export interface AuthContextValue {
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

export const AuthContext = createContext<AuthContextValue | null>(null);

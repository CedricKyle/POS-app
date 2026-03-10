import { getApp, initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

const USER_CREATION_APP_NAME = "UserCreation";

/** Returns an isolated Auth instance used only for creating new accounts.
 *  Uses an existing secondary app if already initialised, otherwise creates one.
 *  This keeps the manager's primary session completely untouched. */
export function getAuthForUserCreation(): Auth {
  try {
    return getAuth(getApp(USER_CREATION_APP_NAME));
  } catch {
    return getAuth(initializeApp(firebaseConfig, USER_CREATION_APP_NAME));
  }
}

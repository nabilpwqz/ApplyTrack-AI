import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";

/**
 * Firebase client configuration parameters.
 */
export const firebaseConfig = {
  apiKey: " ----------------",
  authDomain: "  -------------------",
  projectId: " --------------------",
  storageBucket: "--------------------",
  messagingSenderId: "--------------------",
  appId: "--------------------",
  measurementId: "--------------------"
};

// Initialize Firebase App
/**
 * Initialized Firebase application instance.
 */
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth & Google Provider
/**
 * Firebase Auth service instance for token verification.
 */
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Initialize Firebase Analytics (safe for non-browser/SSR)
export let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics not supported in current environment
  });
}

export {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile
};

export default app;

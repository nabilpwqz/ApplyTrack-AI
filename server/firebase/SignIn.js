import {
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  sendPasswordResetEmail
} from "./firebase.js";

/**
 * Helper to map Firebase Auth error codes to user-friendly messages
 */
export function formatAuthError(error) {
  if (!error) return "An unknown error occurred.";
  const code = error.code || "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email or password. Please check your credentials or create an account.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Please log in.";
    case "auth/weak-password":
      return "Password should be at least 6 characters long.";
    case "auth/popup-closed-by-user":
      return "Google sign-in popup was closed before completing.";
    case "auth/cancelled-popup-request":
      return "Google sign-in was cancelled.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please wait a few minutes before trying again.";
    default:
      return error.message || "Authentication failed. Please try again.";
  }
}

/**
 * Sign In with Firebase Email & Password
 * @param {string} email
 * @param {string} password
 */
export async function signIn(email, password) {
  const errorElement = document.getElementById("authErrorMessage");
  if (errorElement) {
    errorElement.textContent = "";
    errorElement.style.display = "none";
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "/";
    return { data: userCredential, error: null };
  } catch (error) {
    const friendlyMsg = formatAuthError(error);
    if (errorElement) {
      errorElement.textContent = friendlyMsg;
      errorElement.style.display = "block";
    }
    return { data: null, error, message: friendlyMsg };
  }
}

/**
 * Sign In with Firebase Google Popup
 */
export async function signInWithGoogle() {
  const errorElement = document.getElementById("authErrorMessage");
  if (errorElement) {
    errorElement.textContent = "";
    errorElement.style.display = "none";
  }

  try {
    let userCredential = null;
    try {
      userCredential = await signInWithPopup(auth, googleProvider);
    } catch (popupErr) {
      if (popupErr.code === "auth/popup-blocked") {
        await signInWithRedirect(auth, googleProvider);
        return { data: null, error: null };
      }
      throw popupErr;
    }
    window.location.href = "/";
    return { data: userCredential, error: null };
  } catch (error) {
    const friendlyMsg = formatAuthError(error);
    if (errorElement) {
      errorElement.textContent = friendlyMsg;
      errorElement.style.display = "block";
    }
    return { data: null, error, message: friendlyMsg };
  }
}

/**
 * Send password reset email with Firebase Auth
 * @param {string} email
 */
export async function resetPassword(email) {
  const errorElement = document.getElementById("authErrorMessage");
  if (errorElement) {
    errorElement.textContent = "";
    errorElement.style.display = "none";
  }

  try {
    await sendPasswordResetEmail(auth, email);
    if (errorElement) {
      errorElement.style.color = "#34d399";
      errorElement.textContent = `Password reset link sent to ${email}. Please check your inbox.`;
      errorElement.style.display = "block";
    }
    return { success: true, error: null };
  } catch (error) {
    const friendlyMsg = formatAuthError(error);
    if (errorElement) {
      errorElement.style.color = "#ef4444";
      errorElement.textContent = friendlyMsg;
      errorElement.style.display = "block";
    }
    return { success: false, error, message: friendlyMsg };
  }
}

export default signIn;

import { FirebaseError } from "firebase/app";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  User
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

const googleProvider = new GoogleAuthProvider();

export const mapAuthError = (error: unknown): string => {
  if (!(error instanceof FirebaseError)) return "An unexpected error occurred. Please try again.";
  
  switch (error.code) {
    case "auth/invalid-email":
      return "The email address is badly formatted.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password. If you don't have an account yet, please click 'Sign up' below.";
    case "auth/email-already-in-use":
      return "This email address is already in use. Try logging in instead.";
    case "auth/weak-password":
      return "The password is too weak. Please use at least 6 characters.";
    case "auth/popup-closed-by-user":
      return "Login popup was closed before completion.";
    case "auth/unauthorized-domain": {
      const domain = window.location.hostname;
      return `Domain "${domain}" is not authorized. Please add it to Firebase Console -> Authentication -> Settings -> Authorized Domains.`;
    }
    case "auth/operation-not-allowed":
      return "This authentication method is not enabled in Firebase Console.";
    case "auth/too-many-requests":
      return "Too many unsuccessful login attempts. Please try again later.";
    default:
      return error.message;
  }
};

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user document exists, if not create it
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || "User",
        createdAt: new Date().toISOString()
      });
    }

    return user;
  } catch (error) {
    throw new Error(mapAuthError(error));
  }
};

export const registerUser = async (email: string, pass: string, displayName: string, birthdate?: string) => {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(user, { displayName });
    
    // Send verification email
    await sendEmailVerification(user);
    
    // Create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName,
      birthdate: birthdate || null,
      createdAt: new Date().toISOString()
    });
    
    return user;
  } catch (error) {
    throw new Error(mapAuthError(error));
  }
};

export const resetPassword = async (email: string) => {
  try {
    return await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw new Error(mapAuthError(error));
  }
};

export const resendVerification = async () => {
  if (auth.currentUser) {
    try {
      return await sendEmailVerification(auth.currentUser);
    } catch (error) {
      throw new Error(mapAuthError(error));
    }
  }
  throw new Error("No user logged in to send verification to.");
};

export const loginUser = async (email: string, pass: string) => {
  try {
    return await signInWithEmailAndPassword(auth, email, pass);
  } catch (error) {
    throw new Error(mapAuthError(error));
  }
};

export const logoutUser = async () => {
  return await signOut(auth);
};

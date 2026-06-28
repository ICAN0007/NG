import { initializeApp, FirebaseError } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, doc, getDocFromServer } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import firebaseConfig from "../../firebase-applet-config.json";

/* 
 * 💡 FIREBASE CONFIGURATION:
 * In this project, the Firebase configuration is automatically loaded from 
 * firebase-applet-config.json at the project root. 
 */

const app = initializeApp(firebaseConfig);

// Initialize Analytics conditionally
export const analytics = typeof window !== 'undefined' 
  ? isSupported().then(yes => yes ? getAnalytics(app) : null).catch(() => null)
  : Promise.resolve(null);

// Use initializeFirestore with settings optimized for sandboxed/iframe environments.
// experimentalForceLongPolling and disabling secondary cache/streams are proven stabilizers.
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  experimentalAutoDetectLongPolling: false,
  useFetchStreams: false,
  ignoreUndefinedProperties: true,
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);

// Connectivity validation as per firebase-integration skill
async function testConnection() {
  try {
    // Attempt to fetch a non-existent doc from a test collection to verify connectivity
    // Using getDocFromServer forces a network request, bypassing any cache
    await getDocFromServer(doc(db, '_connection_test', 'ping'));
    console.log("Firebase connection verified");
  } catch (error) {
    // We catch and log warnings but don't rethrow to allow the app to operate in fallback mode
    if (error instanceof Error) {
      if (error.message.includes('unavailable') || error.message.includes('the client is offline')) {
        console.warn("Firebase connection unreachable (transient or network-restricted). Fallback data will be used.");
      } else if (error.message.includes('permission-denied') || (error instanceof FirebaseError && error.code === 'permission-denied')) {
        // Permission denied still means we reached the server!
        console.log("Firebase connection verified (Server reached)");
      } else {
        console.error("Firebase initialization info:", error);
      }
    } else {
      console.error("Firebase initialization info (unknown):", error);
    }
  }
}

// Only run on client side and after a short delay
if (typeof window !== 'undefined') {
  setTimeout(testConnection, 2000);
}

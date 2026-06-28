import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import { handleFirestoreError, OperationType } from "./firestore-utils";

/**
 * Collects details of the authenticated/verified visitor and saves it to Firestore.
 * This runs ONLY after the visitor consents by clicking "Yes, I am 18+".
 */
export const logVisitor = async () => {
  const path = "visitors";
  console.log("🔥 logVisitor triggered");
  try {
    let ip = "unknown";
    try {
      console.log("Fetching IP from ipify...");
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 4000);
      const response = await fetch("https://api.ipify.org?format=json", { signal: controller.signal });
      clearTimeout(id);
      
      if (response.ok) {
        const data = await response.json();
        ip = data.ip || "unknown";
        console.log("IP found:", ip);
      }
    } catch (e) {
      console.warn("IP fetch failed, proceeding with 'unknown' IP", e);
    }

    // Capture visitor data conforming exactly to requested fields
    const visitorData = {
      ip: String(ip),
      userAgent: String(navigator.userAgent || "unknown"),
      platform: String(navigator.platform || "unknown"),
      screenWidth: Number(window.screen?.width || window.innerWidth || 0),
      screenHeight: Number(window.screen?.height || window.innerHeight || 0),
      referrer: String(document.referrer || "direct"),
      timestamp: new Date().toISOString(),
      ageVerified: true
    };

    console.log("Saving visitor data to Firestore:", visitorData);

    // Save to visitors collection in Firestore
    const docRef = await addDoc(collection(db, path), visitorData);
    console.log("Visitor logged successfully with ID:", docRef.id);

    // Mark as logged in sessionStorage to avoid logging multiple times in the same session, if needed
    sessionStorage.setItem("visitor_logged", "true");
  } catch (error) {
    console.error("❌ logVisitor FAILED:");
    if (error instanceof Error && (error.message.includes("permission") || error.message.includes("Insufficient"))) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } else {
      console.error("Non-Firestore Error:", error);
    }
  }
};


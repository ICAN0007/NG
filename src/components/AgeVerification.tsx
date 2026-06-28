import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldAlert, Check, X } from "lucide-react";
import { logVisitor } from "../lib/tracking";

/**
 * 💡 FIREBASE CONFIGURATION GUIDE FOR THIS APP:
 * 
 * 1. Your Firebase credentials reside in `@/firebase-applet-config.json` at the project root.
 * 2. Firestore is initialized inside `@/src/lib/firebase.ts`:
 *    ```ts
 *    import { initializeApp } from "firebase/app";
 *    import { getFirestore } from "firebase/firestore";
 *    import firebaseConfig from "../../firebase-applet-config.json";
 *    
 *    const app = initializeApp(firebaseConfig);
 *    export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
 *    ```
 * 3. Security rules in `/firestore.rules` must allow public writes to `/visitors`:
 *    ```javascript
 *    match /visitors/{visitorId} {
 *      allow create: if true;
 *      allow read: if isAdmin();
 *    }
 *    ```
 */

const AgeVerification = () => {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [accessDenied, setAccessDenied] = useState<boolean>(false);

  useEffect(() => {
    // Check if user has already completed age verification in their browser
    const verified = localStorage.getItem("age-verified");
    if (verified === "true") {
      setIsVerified(true);
    } else {
      setIsVerified(false);
    }
  }, []);

  const handleVerify = () => {
    // 1. Mark as verified immediately in UI for instant feedback
    localStorage.setItem("age-verified", "true");
    setIsVerified(true);
    
    // 2. Fire tracking in the background without blocking the user
    logVisitor().catch(error => {
      console.error("Delayed tracking error:", error);
    });
  };

  const handleDecline = () => {
    setAccessDenied(true);
  };

  if (isVerified === null || isVerified === true) return null;

  return (
    <AnimatePresence>
      {!isVerified && (
        <motion.div
          id="age-verification-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
        >
          {/* Main Card with premium ambient glassmorphism aesthetics */}
          <motion.div
            id="age-verification-card"
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="relative w-full max-w-md bg-[#0d0d0d] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col font-sans text-white"
          >
            {/* Visual Accent header */}
            <div className="h-1 bg-gradient-to-r from-red-500 via-primary to-purple-600 w-full" />

            {!accessDenied ? (
              <div className="p-8 flex flex-col items-center text-center">
                {/* Dynamic visual shield representation */}
                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-6">
                  <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse" />
                </div>

                <h1 className="text-xl md:text-2xl font-black tracking-tight uppercase mb-3">
                  Age Verification
                </h1>

                <p className="text-white/60 text-sm md:text-base leading-relaxed mb-8">
                  This website contains premium mature media content. 
                  You must be <span className="text-white font-bold underline decoration-red-500">18 years of age or older</span> to access this platform.
                </p>

                {/* Grid layout for structured responses */}
                <div className="w-full space-y-3">
                  <button
                    id="btn-verify-yes"
                    onClick={handleVerify}
                    className="w-full py-3.5 px-6 rounded-xl bg-white text-black font-black text-sm tracking-widest uppercase hover:bg-neutral-200 transition-all active:scale-[0.98] cursor-pointer shadow-lg flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4 text-black" />
                    <span>Yes, I am 18+</span>
                  </button>

                  <button
                    id="btn-verify-no"
                    onClick={handleDecline}
                    className="w-full py-3.5 px-6 rounded-xl bg-white/5 border border-white/10 text-white/55 font-bold text-sm hover:bg-white/10 hover:text-white transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4 text-white/40" />
                    <span>No, I am under 18</span>
                  </button>
                </div>
                
                <p className="text-[10px] text-white/30 tracking-widest uppercase mt-6 font-mono">
                  Respects User Privacy & GDPR Compliance
                </p>
              </div>
            ) : (
              // Access denied state
              <div className="p-8 flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-red-950/30 border border-red-500/25 rounded-full flex items-center justify-center mb-6">
                  <X className="w-6 h-6 text-red-500" />
                </div>

                <h1 className="text-xl font-black text-red-500 tracking-tight uppercase mb-3">
                  Access Denied
                </h1>

                <p className="text-white/60 text-sm leading-relaxed mb-6">
                  We are sorry, but you must be 18 or older to view the contents of this website.
                </p>

                <a
                  href="https://google.com"
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all text-sm uppercase tracking-wide"
                >
                  Exit Website
                </a>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AgeVerification;

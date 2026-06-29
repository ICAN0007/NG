import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { ChevronLeft, Mail, Lock, User as UserIcon, AlertCircle, Loader2 } from "lucide-react";
import { registerUser, loginUser, loginWithGoogle, logoutUser, resetPassword } from "@/lib/auth-service";
import PixelAtmosphere from "@/components/PixelAtmosphere";
import { useFirebase } from "@/context/FirebaseContext";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const initialMode = (searchParams.get("mode") as "login" | "signup" | "reset") || "login";
  const [mode, setMode] = useState<"login" | "signup" | "reset">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useFirebase();
  const from = location.state?.from || "/";

  useEffect(() => {
    const urlMode = searchParams.get("mode") as "login" | "signup" | "reset";
    if (urlMode && (urlMode === "login" || urlMode === "signup" || urlMode === "reset")) {
      setMode(urlMode);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user && !authLoading) {
      navigate(from);
    }
  }, [user, authLoading, navigate, from]);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await loginWithGoogle();
      navigate(from);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Google authentication failed");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await resetPassword(email);
      setSuccess("Password reset link sent to your email!");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "reset") return handleResetPassword(e);
    
    // Validation
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (mode === "signup") {
      if (!displayName.trim()) {
        setError("Please enter a display name.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (!birthdate) {
        setError("Please enter your birthdate.");
        return;
      }
    } else {
      if (!password) {
        setError("Please enter your password.");
        return;
      }
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === "login") {
        await loginUser(trimmedEmail, password);
        // Navigation is handled by useEffect when user state changes
      } else {
        await registerUser(trimmedEmail, password, displayName.trim(), birthdate);
        setVerificationSent(true);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred during authentication");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6">
      <div className="pointer-events-none fixed inset-0 z-0">
        <PixelAtmosphere density={40} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 group">
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Gallery</span>
        </Link>

        {error && error.includes("not authorized") ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 mb-8 text-left space-y-4 shadow-2xl shadow-red-500/5"
          >
            <div className="flex items-center gap-3 text-red-500">
              <AlertCircle className="h-6 w-6" />
              <h2 className="text-sm font-black uppercase tracking-widest">Unauthorized Domain</h2>
            </div>
            <p className="text-white/60 text-xs leading-relaxed">
              Firebase authentication is blocked because this domain is not on your list of authorized domains.
            </p>
            <div className="bg-black/40 rounded-xl p-4 border border-white/5 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Steps to fix:</p>
              <ol className="text-xs text-white/70 space-y-2 list-decimal ml-4">
                <li>Go to <span className="text-white font-bold">Firebase Console</span></li>
                <li>Navigate to <span className="text-white font-bold">Authentication</span> &rarr; <span className="text-white font-bold">Settings</span></li>
                <li>Select <span className="text-white font-bold">Authorized Domains</span></li>
                <li>Click <span className="text-white font-bold">Add Domain</span> and enter:</li>
              </ol>
              <div className="bg-white/5 p-3 rounded-lg border border-white/10 font-mono text-[10px] text-primary flex items-center justify-between group cursor-pointer" onClick={() => {
                navigator.clipboard.writeText(window.location.hostname);
                setSuccess("Copied domain to clipboard!");
              }}>
                <span>{window.location.hostname}</span>
                <span className="text-white/20 group-hover:text-white/50 transition-colors uppercase font-black tracking-tighter">Copy</span>
              </div>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors"
            >
              Close & Dismiss
            </button>
          </motion.div>
        ) : null}

        <div className="mb-10 text-left">
          <h1 className="text-4xl font-black tracking-tighter mb-2 uppercase">
            {mode === "login" ? "LOG IN" : mode === "signup" ? "SIGN UP" : "RESET"}
          </h1>
          <p className="text-white/70 text-sm font-medium">
            {verificationSent 
              ? "Check your inbox to complete registration" 
              : mode === "reset" 
                ? "Enter your email to receive a reset link"
                : "Discover the world's top cam models."}
          </p>
          {!verificationSent && (
            <div className="mt-4 flex gap-4">
              <button
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-sm font-black tracking-widest text-primary hover:text-primary/80 uppercase transition-colors"
              >
                {mode === "login" ? "Not a member? Sign up" : "Back to Login"}
              </button>
            </div>
          )}
        </div>

        {verificationSent ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center space-y-6"
          >
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
              <Mail className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black italic">Verification Email Sent</h2>
              <p className="text-white/40 text-sm leading-relaxed">
                We've sent a verification link to <span className="text-white font-bold">{email}</span>. 
                Please click the link in the email to confirm your account and sign in.
              </p>
            </div>
            <button
              onClick={() => {
                setVerificationSent(false);
                setMode("login");
              }}
              className="w-full bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-2xl transition-all"
            >
              GO TO LOGIN
            </button>
          </motion.div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {mode === "signup" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block ml-1">Username</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <input
                      type="text"
                      placeholder="Display Name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-[#1a1c21] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1a1c21] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                required
              />
            </div>
          </div>

          {mode !== "reset" && (
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1a1c21] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  required
                />
              </div>
            </div>
          )}

          {mode === "login" && (
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => setMode("reset")}
                className="text-[10px] font-black tracking-widest text-primary hover:text-primary/80 uppercase transition-colors text-left ml-1"
              >
                Forgot Password?
              </button>
              <label className="flex items-center gap-3 cursor-pointer group ml-1">
                <div className="relative h-5 w-5 bg-[#1a1c21] border border-white/10 rounded flex items-center justify-center group-hover:border-primary/50 transition-colors">
                  <input type="checkbox" className="peer absolute inset-0 opacity-0 cursor-pointer" />
                  <div className="h-2 w-2 bg-primary rounded-sm opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-xs font-medium text-white/70 group-hover:text-white transition-colors">Remember this device</span>
              </label>
            </div>
          )}

          <AnimatePresence>
            {mode === "signup" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block ml-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#1a1c21] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block ml-1">Birthdate</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={birthdate}
                      onChange={(e) => setBirthdate(e.target.value)}
                      className="w-full bg-[#1a1c21] border border-white/5 rounded-xl py-4 px-4 text-sm focus:outline-none focus:border-primary/50 transition-colors [color-scheme:dark]"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{success}</p>
            </motion.div>
          )}

          {mode === "signup" && (
            <p className="text-[10px] text-white/40 font-medium leading-relaxed mt-4">
              Creating an account means you're okay with our{" "}
              <Link to="/terms" className="text-primary font-black hover:underline">Terms of Service</Link>,{" "}
              <Link to="/privacy" className="text-primary font-black hover:underline">Privacy Policy</Link>.
            </p>
          )}

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full bg-[#ff9f1c] hover:bg-[#ff9f1c]/90 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center disabled:opacity-50 mt-6"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              mode === "login" ? "Login" : mode === "signup" ? "Create account" : "Send Reset Link"
            )}
          </button>
        </form>

        {mode !== "reset" && (
          <>
            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-[10px] font-black italic tracking-widest">
                <span className="bg-[#050505] px-4 text-white/20">OR</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <button
                onClick={handleGoogleLogin}
                disabled={loading || googleLoading}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-white text-black font-black text-sm uppercase tracking-widest hover:bg-neutral-200 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {googleLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Login with Google</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}

        <div className="mt-8 text-center">
        </div>
      </>
    )}

    <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap justify-center gap-6 text-[10px] font-bold tracking-widest text-white/20 uppercase">
          <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link to="/dmca" className="hover:text-white transition-colors">DMCA</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;

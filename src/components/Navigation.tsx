import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, User, PlayCircle, Image, Bookmark, LogIn, LogOut, ChevronLeft, Search, X, MessageSquare } from "lucide-react";
import { useFirebase } from "@/context/FirebaseContext";
import { logoutUser } from "@/lib/auth-service";
import { motion, AnimatePresence } from "motion/react";

export const DesktopHeader = () => {
  const { user } = useFirebase();
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <header className="hidden md:flex border-b border-white/5 px-6 py-4 items-center justify-between sticky top-0 z-50 bg-black/95 backdrop-blur-xl h-20">
      <div className="flex items-center gap-8">
        <nav className="flex items-center gap-6 text-[10px] font-black tracking-widest text-white/40">
          <Link 
            to="/" 
            className={`hover:text-white transition-colors uppercase ${location.pathname === '/' ? 'text-primary' : ''}`}
          >
            HOME
          </Link>
          <Link 
            to="/models" 
            className={`hover:text-primary transition-colors uppercase ${location.pathname.startsWith('/models') ? 'text-primary' : ''}`}
          >
            MODELS
          </Link>
          <Link 
            to="/galleries" 
            className={`hover:text-primary transition-colors uppercase ${location.pathname.startsWith('/galleries') || location.pathname.startsWith('/gallery') ? 'text-primary' : ''}`}
          >
            GALLERIES
          </Link>
          <Link 
            to="/sup" 
            className={`hover:text-primary transition-colors uppercase ${location.pathname === '/sup' ? 'text-primary' : ''}`}
          >
            SUP
          </Link>
          <a 
            href="https://t.me/Vibevault_18" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-[#229ED9] transition-colors uppercase flex items-center gap-1.5"
          >
            TELEGRAM
          </a>
        </nav>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none md:pointer-events-auto">
        <Link to="/" className="group flex flex-col items-center">
          <span className="text-xl md:text-2xl font-black tracking-tighter text-white group-hover:text-primary transition-colors leading-none uppercase">
            NAKED <span className="text-primary italic group-hover:text-white">GIRLS</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-6">
        {user ? (
          <div className="flex items-center gap-4">
            <Link 
              to="/library"
              className={`text-[10px] font-black tracking-widest uppercase transition-colors ${location.pathname === '/library' ? 'text-primary' : 'text-white/60 hover:text-primary'}`}
            >
              Library
            </Link>
            <button 
              onClick={() => logoutUser()}
              className="text-[10px] font-black tracking-widest text-primary hover:text-white uppercase transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <Link 
            to="/auth"
            state={{ from: location.pathname }}
            className="text-[10px] font-black tracking-widest text-primary hover:text-white uppercase transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};

export const MobileHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isRoot = location.pathname === "/" || location.pathname === "/models" || location.pathname === "/galleries" || location.pathname === "/sup";

  return (
    <header className="md:hidden border-b border-white/5 px-4 py-3 flex items-center justify-between sticky top-0 z-50 bg-black/95 backdrop-blur-xl min-h-[56px]">
      <div className="w-10">
        {!isRoot ? (
          <button 
            onClick={() => navigate(-1)}
            className="h-10 w-10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        ) : (
          <a 
            href="https://t.me/Vibevault_18" 
            target="_blank" 
            rel="noopener noreferrer"
            className="h-10 w-10 flex items-center justify-center text-[#229ED9]/80 hover:text-[#229ED9] transition-colors"
          >
            <MessageSquare className="h-5 w-5" />
          </a>
        )}
      </div>
      
      <div className="flex-1 flex justify-center">
        <Link to="/" className="group flex flex-col items-center">
          <span className="text-base font-black tracking-tighter text-white leading-none uppercase text-center">
            NAKED <span className="text-primary italic">GIRLS</span>
            <span className="block text-[8px] tracking-[0.3em] opacity-40 font-bold -mt-1 uppercase">Official Gallery</span>
          </span>
        </Link>
      </div>

      <div className="w-10 flex justify-end">
         <Link 
            to="/auth"
            className="h-10 w-10 flex items-center justify-center text-white/40 hover:text-primary transition-colors"
          >
            <User className="h-5 w-5" />
          </Link>
      </div>
    </header>
  );
};

export const BottomNav = () => {
  const { user } = useFirebase();
  const location = useLocation();

  const navItems = [
    { label: "HOME", icon: Home, path: "/" },
    { label: "MODELS", icon: User, path: "/models" },
    { label: "GALLERIES", icon: Image, path: "/galleries" },
    { label: "SUP", icon: PlayCircle, path: "/sup" },
    { label: "LIBRARY", icon: Bookmark, path: "/library" },
  ];

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[400px]">
      <nav className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-full py-3 px-6 flex items-center justify-around shadow-2xl shadow-primary/20">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-primary scale-110' : 'text-white/40 hover:text-white'}`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[8px] font-black tracking-widest uppercase">{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="active-indicator"
                  className="h-1 w-1 rounded-full bg-primary absolute -bottom-1"
                />
              )}
            </Link>
          );
        })}
        {!user && (
          <Link 
            to="/auth"
            state={{ from: location.pathname }}
            className={`flex flex-col items-center gap-1 transition-all ${location.pathname === '/auth' ? 'text-primary scale-110' : 'text-white/40 hover:text-white'}`}
          >
            <LogIn className="h-5 w-5" />
            <span className="text-[8px] font-black tracking-widest uppercase">SIGN IN</span>
          </Link>
        )}
      </nav>
    </div>
  );
};

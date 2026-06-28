import React, { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface LightboxProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ images, currentIndex, onClose, onNext, onPrev }) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowRight") onNext();
    if (e.key === "ArrowLeft") onPrev();
  }, [onClose, onNext, onPrev]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [handleKeyDown]);

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-3xl"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-[110] p-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all active:scale-90"
        >
          <X size={24} />
        </button>

        <button 
          onClick={onPrev}
          className="absolute left-6 z-[110] p-4 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all active:scale-95 invisible md:visible"
        >
          <ChevronLeft size={32} />
        </button>

        <button 
          onClick={onNext}
          className="absolute right-6 z-[110] p-4 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all active:scale-95 invisible md:visible"
        >
          <ChevronRight size={32} />
        </button>

        <div className="relative w-full h-[80vh] flex items-center justify-center px-4" onClick={(e) => e.stopPropagation()}>
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.3 }}
              src={images[currentIndex]}
              alt={`Image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
              referrerPolicy="no-referrer"
            />
          </AnimatePresence>
          
          <div className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 text-[10px] font-black tracking-[0.3em] text-white/40 uppercase">
            {currentIndex + 1} / {images.length}
          </div>
        </div>

        {/* Swipe Area for Mobile */}
        <div className="absolute inset-0 z-[105] md:hidden" onClick={onClose} />
        <div className="absolute left-0 top-0 bottom-0 w-1/4 z-[106] md:hidden" onClick={(e) => { e.stopPropagation(); onPrev(); }} />
        <div className="absolute right-0 top-0 bottom-0 w-1/4 z-[106] md:hidden" onClick={(e) => { e.stopPropagation(); onNext(); }} />
      </motion.div>
    </AnimatePresence>
  );
};

export default Lightbox;

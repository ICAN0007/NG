import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VideoGalleryProps {
  images: string[];
}

export const VideoGallery: React.FC<VideoGalleryProps> = ({ images }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const navigateGallery = useCallback((direction: 'prev' | 'next') => {
    if (selectedIndex === null) return;
    
    let newIndex = direction === 'prev' ? selectedIndex - 1 : selectedIndex + 1;
    
    // Wrap around
    if (newIndex < 0) newIndex = images.length - 1;
    if (newIndex >= images.length) newIndex = 0;
    
    setSelectedIndex(newIndex);
  }, [selectedIndex, images.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'ArrowLeft') navigateGallery('prev');
      if (e.key === 'ArrowRight') navigateGallery('next');
      if (e.key === 'Escape') setSelectedIndex(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, navigateGallery]);

  if (!images || images.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      // Scroll by roughly one item's width + gap
      let scrollAmount = container.clientWidth * 0.85; // default mobile
      if (window.innerWidth >= 1024) scrollAmount = container.clientWidth * 0.31;
      else if (window.innerWidth >= 640) scrollAmount = container.clientWidth * 0.45;

      const newScroll = direction === 'left' 
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;
      
      container.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="relative flex items-center justify-center py-6 border-y border-white/5">
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
          <div className="w-full border-t border-white/10" />
        </div>
        <h3 className="relative z-10 text-sm sm:text-base font-black tracking-[1.2em] text-white/90 uppercase text-center pl-[1.2em]">
          Gallery
        </h3>
        <div className="absolute inset-y-0 left-4 right-4 flex items-center justify-between pointer-events-none">
          <button 
            onClick={() => scroll('left')}
            className="p-4 text-white/20 hover:text-white transition-colors pointer-events-auto"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="p-4 text-white/20 hover:text-white transition-colors pointer-events-auto"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-4 sm:px-0"
      >
        {images.map((img, idx) => (
          <motion.div
            key={idx}
            className="relative flex-none w-[85%] sm:w-[45%] lg:w-[31%] aspect-[16/9] overflow-hidden group cursor-pointer snap-center bg-zinc-900 border border-white/5 rounded-xl shadow-2xl"
            onClick={() => setSelectedIndex(idx)}
          >
            <img 
              src={img} 
              alt={`Gallery ${idx + 1}`}
              className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/95 backdrop-blur-xl"
            onClick={() => setSelectedIndex(null)}
          >
            <motion.button
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-[110] font-black tracking-widest text-xs"
              onClick={() => setSelectedIndex(null)}
            >
              CLOSE
            </motion.button>

            {/* Navigation Buttons */}
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 sm:px-12 pointer-events-none">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateGallery('prev');
                }}
                className="p-4 sm:p-6 rounded-full bg-white/5 hover:bg-white/10 text-white/30 hover:text-white transition-all pointer-events-auto border border-white/5 hover:scale-110 active:scale-95 group"
              >
                <ChevronLeft className="h-8 w-8 sm:h-12 sm:w-12 group-hover:-translate-x-1 transition-transform" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateGallery('next');
                }}
                className="p-4 sm:p-6 rounded-full bg-white/5 hover:bg-white/10 text-white/30 hover:text-white transition-all pointer-events-auto border border-white/5 hover:scale-110 active:scale-95 group"
              >
                <ChevronRight className="h-8 w-8 sm:h-12 sm:w-12 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none">
              <motion.img
                key={selectedIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                src={images[selectedIndex]}
                alt={`Full view ${selectedIndex + 1}`}
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[85vh] rounded-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] object-contain border border-white/10"
                onClick={(e) => e.stopPropagation()}
              />
              
              {/* Index Indicator */}
              <motion.div 
                className="mt-6 text-white/30 font-black tracking-[0.3em] text-[10px] uppercase"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Image {selectedIndex + 1} <span className="opacity-10 mx-2">/</span> {images.length}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

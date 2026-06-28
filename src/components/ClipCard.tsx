import React, { useState, useRef } from "react";
import { Play } from "lucide-react";
import { motion } from "motion/react";
import { SupClip } from "@/lib/sup-data";

interface ClipCardProps {
  clip: SupClip;
  onClick: () => void;
}

export const ClipCard: React.FC<ClipCardProps> = ({ clip, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const showPreview = isHovered && (clip.previewVideoUrl || (clip.url || "").toLowerCase().includes('.mp4'));

  return (
    <motion.div
      whileHover={{ y: -5 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-white/5 border border-white/5 cursor-pointer shadow-lg shadow-black/20"
    >
      <img 
        src={clip.thumbnail || clip.url || ""} 
        alt={clip.title || "Clip"}
        loading="lazy"
        className={`w-full h-full object-cover transition-all duration-500 ${
          showPreview ? 'opacity-0 scale-110' : 'opacity-100 group-hover:scale-110'
        }`}
      />
      
      {showPreview && (
        <video
          ref={videoRef}
          src={clip.previewVideoUrl || clip.url || ""}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover animate-in fade-in zoom-in-105 duration-500"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 z-10">
        <p className="text-[10px] font-black text-white uppercase tracking-widest line-clamp-2 leading-tight">
          {clip.title}
        </p>
      </div>

      <div className="absolute top-3 right-3 p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 z-20 transition-transform group-hover:scale-110">
        <Play size={12} className="text-white fill-white ml-0.5" />
      </div>

      {/* Progress line for preview */}
      {showPreview && (
        <div className="absolute bottom-0 left-0 h-1 bg-primary w-full origin-left animate-[progress_3s_linear_infinite]" />
      )}
    </motion.div>
  );
};

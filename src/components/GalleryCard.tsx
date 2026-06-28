import React from "react";
import { Link } from "react-router-dom";
import { Gallery } from "../types";
import { motion } from "motion/react";
import { Image as ImageIcon } from "lucide-react";

interface GalleryCardProps {
  gallery: Gallery;
}

const GalleryCard: React.FC<GalleryCardProps> = ({ gallery }) => {
  return (
    <Link to={`/gallery/${gallery.slug}`} className="group block">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[24px] bg-zinc-900 border border-white/10 transition-all duration-500 group-hover:border-primary/50 group-hover:shadow-[0_20px_40px_-15px_rgba(var(--primary-rgb),0.3)]">
        <img 
          src={gallery.coverImage} 
          alt={gallery.title}
          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-[1500ms] ease-out"
          referrerPolicy="no-referrer"
        />
        
        {/* Subtle Bottom Vignette for text legibility if needed, but keeping it very clear */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Image Count Badge - Premium Glassmorphism */}
        <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2 shadow-xl">
          <ImageIcon size={12} className="text-primary" />
          <span className="text-[9px] font-black tracking-[0.2em] text-white uppercase">{gallery.images.length} PHOTOS</span>
        </div>

        {/* Hover info overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
           <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">PRO COLLECTION</p>
           <h4 className="text-sm font-bold text-white line-clamp-1 truncate">{gallery.title}</h4>
        </div>
      </div>

      <div className="mt-4 px-2 space-y-1">
        <div className="flex items-center justify-between gap-4">
           <span className="text-[10px] font-black tracking-[0.3em] text-primary uppercase">{gallery.modelName}</span>
           {gallery.studio && (
             <span className="text-[9px] font-bold tracking-[0.2em] text-white/20 uppercase">{gallery.studio}</span>
           )}
        </div>
        <h3 className="text-sm font-bold text-white/80 group-hover:text-white transition-colors line-clamp-1 tracking-tight">
          {gallery.title}
        </h3>
      </div>
    </Link>
  );
};

export default GalleryCard;

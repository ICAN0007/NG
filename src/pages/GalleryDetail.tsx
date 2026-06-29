import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getGalleryBySlug } from "../lib/galleries";
import { motion } from "motion/react";
import { DesktopHeader, MobileHeader, BottomNav } from "../components/Navigation";
import Footer from "../components/Footer";
import Lightbox from "../components/Lightbox";
import PixelAtmosphere from "../components/PixelAtmosphere";
import { ChevronLeft, Info, Grid } from "lucide-react";

const GalleryDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const gallery = getGalleryBySlug(slug || "");
  
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  if (!gallery) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-black text-white uppercase tracking-widest mb-4">Gallery Not Found</h1>
          <Link to="/galleries" className="text-primary font-black uppercase text-xs tracking-widest hover:underline">Back to Galleries</Link>
        </div>
      </div>
    );
  }

  const handleNext = () => {
    setSelectedImageIndex((prev) => (prev !== null ? (prev + 1) % gallery.images.length : null));
  };

  const handlePrev = () => {
    setSelectedImageIndex((prev) => (prev !== null ? (prev - 1 + gallery.images.length) % gallery.images.length : null));
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white">
      <DesktopHeader />
      <MobileHeader />

      {/* Hero Section */}
      <section className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden cursor-pointer group" onClick={() => setSelectedImageIndex(0)}>
        <div className="absolute inset-0">
          <img 
            src={gallery.coverImage} 
            alt={gallery.title}
            className="w-full h-full object-cover object-[center_30%] group-hover:scale-110 transition-transform duration-[3000ms] ease-out opacity-100 group-hover:brightness-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-transparent to-black/20" />
        </div>
        
        <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-24">
          <motion.button 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={(e) => { e.stopPropagation(); navigate(-1); }}
            className="flex items-center gap-3 px-5 py-2 bg-white/5 border border-white/10 backdrop-blur-md rounded-full text-[10px] font-black tracking-widest text-white hover:bg-white/10 transition-all uppercase mb-10 w-fit"
          >
            <ChevronLeft size={16} className="text-primary" />
            Return to Vault
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
             <div className="flex items-center gap-3 mb-6">
               <span className="w-10 h-0.5 bg-primary" />
               <span className="text-primary text-[10px] font-black uppercase tracking-[0.4em]">EXCLUSIVE COLLECTION</span>
             </div>
             <h1 className="text-4xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-8 italic uppercase drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]">
               {gallery.modelName} <br />
               <span className="text-primary not-italic text-[0.6em]">&</span> {gallery.title}
             </h1>
             <div className="flex flex-wrap items-center gap-8 text-[11px] font-black tracking-[0.3em] text-white/50 uppercase">
               <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                 <span className="text-white">{gallery.studio}</span>
               </div>
               <span>•</span>
               <span>{gallery.images.length} ULTRA-HD SHOTS</span>
               <span>•</span>
               <span className="px-3 py-1 border border-white/20 rounded-md">4K QUALITY</span>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-20">
          {/* Sidebar / Info */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-16">
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Info size={14} className="text-primary" />
                  </div>
                  <h3 className="text-[11px] font-black tracking-[0.4em] text-white uppercase">SITREP</h3>
                </div>
                <p className="text-base text-white/50 leading-relaxed font-medium italic">
                  "{gallery.description}"
                </p>
              </div>
              
              <div className="p-8 rounded-[32px] bg-gradient-to-br from-white/5 to-transparent border border-white/10 backdrop-blur-2xl">
                 <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-8 border-b border-white/5 pb-4">FILE DATA</h4>
                 <ul className="space-y-6">
                   <li className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                     <span className="text-white/30">RESOLUTION</span>
                     <span className="text-primary">3840×2160</span>
                   </li>
                   <li className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                     <span className="text-white/30">FORMAT</span>
                     <span className="text-white">PRO WEBP</span>
                   </li>
                   <li className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                     <span className="text-white/30">MODEL</span>
                     <span className="text-white">{gallery.modelName}</span>
                   </li>
                 </ul>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="lg:col-span-3">
             <div className="flex items-center justify-between mb-16">
               <div className="flex items-center gap-5">
                 <Grid size={24} className="text-primary" />
                 <h2 className="text-3xl font-black text-white tracking-widest uppercase italic">GALLERY <span className="text-primary not-italic">FILES</span></h2>
               </div>
               <div className="h-0.5 flex-1 bg-white/5 mx-8 rounded-full" />
               <span className="text-[10px] font-black text-white/30 tracking-widest uppercase">END OF FILE</span>
             </div>

             <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
               {gallery.images.slice(1).map((img, idx) => (
                 <motion.div
                   key={idx}
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true, margin: "-100px" }}
                   transition={{ delay: (idx % 3) * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                   className="aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer bg-zinc-950 border border-white/5 group relative shadow-2xl"
                   onClick={() => setSelectedImageIndex(idx + 1)}
                 >
                   <img 
                     src={img} 
                     alt={`${gallery.title} - ${idx + 2}`}
                     className="w-full h-full object-cover transition-all duration-[1.5s] group-hover:scale-110 group-hover:brightness-110 grayscale-[0.3] group-hover:grayscale-0"
                     loading="lazy"
                     referrerPolicy="no-referrer"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                   
                   <div className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                      <span className="text-[9px] font-black text-white">{idx + 2}</span>
                   </div>
                 </motion.div>
               ))}
             </div>
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
      <PixelAtmosphere density={30} />

      {selectedImageIndex !== null && (
        <Lightbox 
          images={gallery.images}
          currentIndex={selectedImageIndex}
          onClose={() => setSelectedImageIndex(null)}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}
    </div>
  );
};

export default GalleryDetailPage;

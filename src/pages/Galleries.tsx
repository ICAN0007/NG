import React, { useState } from "react";
import { motion } from "motion/react";
import { galleries } from "../lib/galleries";
import GalleryCard from "../components/GalleryCard";
import { DesktopHeader, MobileHeader, BottomNav } from "../components/Navigation";
import Footer from "../components/Footer";
import PixelAtmosphere from "../components/PixelAtmosphere";
import { Search } from "lucide-react";

const GalleriesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGalleries = galleries.filter(g => 
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    g.modelName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30">
      <DesktopHeader />
      <MobileHeader />

      {/* Hero Section */}
      <section className="relative w-full h-[40vh] md:h-[50vh] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">
          <img 
            src="https://i.ibb.co/sv6xB24S/logoremover-1781355922566.jpg" 
            onContextMenu={(e) => e.preventDefault()}
            className="w-full h-full object-cover object-[center_35%] opacity-40 grayscale-[0.5] contrast-125"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
        </div>
        
        <div className="relative z-10 text-center px-6">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter italic uppercase mb-4 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
          >
            IMAGE <span className="text-primary not-italic">VAULT</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white font-black text-[10px] md:text-xs tracking-[0.5em] uppercase drop-shadow-md"
          >
            Premium 4K Ultra High-Resolution Collections
          </motion.p>
        </div>
      </section>

      {/* Search & Filter */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <Search size={18} className="text-white/20" />
          </div>
          <input 
            type="text" 
            placeholder="SEARCH GALLERIES OR MODELS..."
            className="w-full bg-white/5 border border-white/10 rounded-full py-5 pl-16 pr-8 text-xs font-black tracking-widest uppercase focus:outline-none focus:border-primary/50 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 pb-24">
        {filteredGalleries.length === 0 ? (
          <div className="py-24 text-center">
             <p className="text-white/20 font-black tracking-widest uppercase">No galleries found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {filteredGalleries.map((gallery, idx) => (
              <motion.div
                key={`${gallery.id}-${idx}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <GalleryCard gallery={gallery} />
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <BottomNav />
      <PixelAtmosphere density={40} />
    </div>
  );
};

export default GalleriesPage;

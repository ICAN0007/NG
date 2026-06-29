import { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ChevronLeft, Heart, Bookmark, Play, Tag } from "lucide-react";
import { useFirebase } from "@/context/FirebaseContext";
import { VideoListCard } from "@/components/VideoListCard";
import { getModelUrlBySlug } from "@/lib/model-utils";
import Footer from "@/components/Footer";
import PixelAtmosphere from "@/components/PixelAtmosphere";

import { DesktopHeader, MobileHeader, BottomNav } from "@/components/Navigation";
import { logoutUser } from "@/lib/auth-service";

const EmptyState = ({ tab }: { tab: string }) => (
  <div className="py-32 text-center space-y-4">
    <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
      {tab === "likes" ? <Heart size={32} /> : tab === "saved" ? <Bookmark size={32} /> : tab === "categories" ? <Tag size={32} /> : <Play size={32} />}
    </div>
    <h3 className="text-xl font-black italic">No {tab} yet</h3>
    <p className="text-white/40 text-sm max-w-xs mx-auto">
      Start browsing our gallery and add some items to your collection!
    </p>
    <Link to="/" className="inline-block text-primary text-xs font-black uppercase tracking-widest hover:underline pt-4">
      Explore Gallery
    </Link>
  </div>
);

const Library = () => {
  const { user, videos, likedVideoIds, savedVideoIds, favoriteModelIds, favoriteCategories, loading } = useFirebase();
  const [activeTab, setActiveTab] = useState<"likes" | "saved" | "models" | "categories">("likes");

  const likedVideos = videos.filter(v => likedVideoIds.has(v.id));
  const savedVideos = videos.filter(v => savedVideoIds.has(v.id));
  const favoriteModelsList = Array.from(favoriteModelIds);
  const favoriteCategoriesList = Array.from(favoriteCategories);

  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-black mb-4 italic">Sign in to view your collection</h2>
        <Link to="/auth" state={{ from: "/library" }} className="bg-primary px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-24 md:pb-0">
      <div className="pointer-events-none fixed inset-0 z-0">
        <PixelAtmosphere density={20} />
      </div>

      <DesktopHeader />
      <MobileHeader />

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="flex gap-4 mb-12 border-b border-white/5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("likes")}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-black tracking-widest uppercase transition-all relative whitespace-nowrap ${
              activeTab === "likes" ? "text-primary" : "text-white/40 hover:text-white"
            }`}
          >
            <Heart size={14} className={activeTab === "likes" ? "fill-current" : ""} />
            Liked Videos
            {activeTab === "likes" && (
              <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-black tracking-widest uppercase transition-all relative whitespace-nowrap ${
              activeTab === "saved" ? "text-primary" : "text-white/40 hover:text-white"
            }`}
          >
            <Bookmark size={14} className={activeTab === "saved" ? "fill-current" : ""} />
            Watch Later
            {activeTab === "saved" && (
              <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("models")}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-black tracking-widest uppercase transition-all relative whitespace-nowrap ${
              activeTab === "models" ? "text-primary" : "text-white/40 hover:text-white"
            }`}
          >
            <Play size={14} />
            Favorite Models
            {activeTab === "models" && (
              <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-black tracking-widest uppercase transition-all relative whitespace-nowrap ${
              activeTab === "categories" ? "text-primary" : "text-white/40 hover:text-white"
            }`}
          >
            <Tag size={14} />
            Saved Categories
            {activeTab === "categories" && (
              <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        {activeTab === "likes" && (
          likedVideos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {likedVideos.map((video) => (
                <VideoListCard key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <EmptyState tab="likes" />
          )
        )}

        {activeTab === "saved" && (
          savedVideos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {savedVideos.map((video) => (
                <VideoListCard key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <EmptyState tab="saved" />
          )
        )}

        {activeTab === "models" && (
          favoriteModelsList.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {favoriteModelsList.map((modelId) => (
                <Link 
                  key={modelId} 
                  to={getModelUrlBySlug(modelId)}
                  className="group bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-primary/50 transition-colors text-center"
                >
                  <div className="aspect-square bg-white/10 rounded-full mb-3 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center text-primary/40 font-black text-2xl italic">
                      {modelId.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <span className="text-[10px] font-black tracking-widest uppercase group-hover:text-primary transition-colors">
                    {modelId.replace(/-/g, ' ')}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState tab="models" />
          )
        )}

        {activeTab === "categories" && (
          favoriteCategoriesList.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {favoriteCategoriesList.map((catId) => (
                <Link 
                  key={catId} 
                  to={`/?filter=${encodeURIComponent(catId.replace(/-/g, ' '))}`}
                  className="group bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-primary/50 transition-colors text-center"
                >
                  <div className="aspect-square bg-white/10 rounded-2xl mb-3 flex items-center justify-center">
                    <Tag size={24} className="text-primary/40" />
                  </div>
                  <span className="text-[10px] font-black tracking-widest uppercase group-hover:text-primary transition-colors">
                    {catId.replace(/-/g, ' ')}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState tab="categories" />
          )
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Library;

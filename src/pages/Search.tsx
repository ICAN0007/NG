import React, { useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { videos, slugifyModel } from "../lib/videos";
import { getModelUrl } from "../lib/model-utils";
import { galleries } from "../lib/galleries";
import { supModels, allSupVideos, isSupVideo } from "../lib/sup-data";
import { DesktopHeader, MobileHeader, BottomNav } from "../components/Navigation";
import Footer from "../components/Footer";
import { VideoCard } from "../components/VideoCard";
import GalleryCard from "../components/GalleryCard";
import { Search, Play, User, Image, ArrowRight } from "lucide-react";

interface ModelItem {
  name: string;
  slug: string;
  thumb: string;
}

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  // Extract unique models from all video sources and sup members
  const allModels = useMemo(() => {
    const modelMap = new Map<string, ModelItem>();
    
    // Add models from main videos
    videos.forEach(v => {
      if (v.model && !modelMap.has(v.model)) {
        modelMap.set(v.model, {
          name: v.model,
          slug: slugifyModel(v.model),
          thumb: v.thumb
        });
      }
    });

    // Add models from all sup videos
    allSupVideos.forEach(v => {
      if (v.model && !modelMap.has(v.model)) {
        modelMap.set(v.model, {
          name: v.model,
          slug: slugifyModel(v.model),
          thumb: v.thumb
        });
      }
    });

    // Add sup members directly (even if no videos)
    supModels.forEach(m => {
      if (!modelMap.has(m.name)) {
        modelMap.set(m.name, {
          name: m.name,
          slug: slugifyModel(m.name),
          thumb: m.image
        });
      }
    });

    return Array.from(modelMap.values());
  }, []);

  // Filter results
  const results = useMemo(() => {
    const q = query.toLowerCase();
    
    // Dynamically exclude Stripchat/OnlyFans models from the search page
    const supNames = new Set(supModels.map(m => m.name.toLowerCase()));
    
    return {
      videos: [...videos, ...allSupVideos]
        .filter(v => 
          (v.title.toLowerCase().includes(q) || (v.model || "").toLowerCase().includes(q)) && 
          !isSupVideo(v)
        )
        .sort((a, b) => {
          const timeA = new Date(a.addedAt).getTime() || 0;
          const timeB = new Date(b.addedAt).getTime() || 0;
          if (timeA !== timeB) return timeB - timeA;
          const numIdA = parseInt(a.id.replace(/\D/g, '')) || 0;
          const numIdB = parseInt(b.id.replace(/\D/g, '')) || 0;
          return numIdB - numIdA;
        }),
      models: allModels.filter(m => 
        m.name.toLowerCase().includes(q) && !supNames.has(m.name.toLowerCase())
      ),
      galleries: galleries.filter(g => 
        g.title.toLowerCase().includes(q) || g.modelName.toLowerCase().includes(q)
      )
    };
  }, [query, allModels]);

  const totalResults = results.videos.length + results.models.length + results.galleries.length;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <DesktopHeader />
      <MobileHeader />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-2">
            <Search size={20} className="text-primary" />
            <span className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase">SEARCH RESULTS</span>
          </div>
          <h1 className="text-3xl md:text-6xl font-black tracking-tighter uppercase italic">
            {query ? (
              <>RESULTS FOR "<span className="text-primary not-italic">{query}</span>"</>
            ) : (
              "EXPLORE ALL CONTENT"
            )}
          </h1>
          <p className="text-[10px] font-black text-white/30 tracking-widest uppercase mt-4">
            FOUND {totalResults} MATCHES ACROSS THE VAULT
          </p>
        </div>

        {totalResults === 0 ? (
          <div className="py-32 text-center border border-white/5 rounded-[40px] bg-white/[0.02]">
            <Search size={48} className="mx-auto text-white/10 mb-6" />
            <h2 className="text-xl font-bold uppercase tracking-widest text-white/40 mb-4">No matches found</h2>
            <Link to="/" className="text-primary font-black uppercase text-xs tracking-widest hover:underline">
               Back to Home
            </Link>
          </div>
        ) : (
          <div className="space-y-24 pb-20">
            {/* Models Section */}
            {results.models.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <User size={18} className="text-primary" />
                  <h3 className="text-xl font-black tracking-widest uppercase italic border-b-2 border-primary/20 pb-2 pr-8">MODELS</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {results.models.map((model) => (
                    <Link 
                      key={model.slug} 
                      to={getModelUrl(model.name)}
                      className="group block relative aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-900 border border-white/5"
                    >
                      <img 
                        src={model.thumb} 
                        alt={model.name}
                        className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 translate-y-2 group-hover:translate-y-0 transition-all">
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">{model.name}</p>
                        <div className="h-0.5 w-0 group-hover:w-full bg-primary transition-all duration-500 mt-1" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Galleries Section */}
            {results.galleries.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <Image size={18} className="text-primary" />
                  <h3 className="text-xl font-black tracking-widest uppercase italic border-b-2 border-primary/20 pb-2 pr-8">GALLERIES</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {results.galleries.map((gallery) => (
                    <GalleryCard key={gallery.id} gallery={gallery} />
                  ))}
                </div>
              </section>
            )}

            {/* Videos Section */}
            {results.videos.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <Play size={18} className="text-primary" />
                  <h3 className="text-xl font-black tracking-widest uppercase italic border-b-2 border-primary/20 pb-2 pr-8">VIDEOS</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                  {results.videos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default SearchPage;

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useFirebase } from "@/context/FirebaseContext";
import { logoutUser } from "@/lib/auth-service";
import { modelCodes, getModelProfile, slugifyModel, getVideoModels, getViews, Video, ModelProfile } from "@/lib/videos";
import { getModelUrl } from "@/lib/model-utils";
import { supModels } from "@/lib/sup-data";
import { useVideos } from "@/hooks/use-videos";
import { useInteractions } from "@/hooks/use-interactions";
import { DesktopHeader, MobileHeader, BottomNav } from "@/components/Navigation";
import { Search, User, ChevronLeft, ChevronRight, Star, Sparkles, ChevronDown, Play, Heart } from "lucide-react";
import PixelAtmosphere from "@/components/PixelAtmosphere";
import Pagination from "@/components/Pagination";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/Skeleton";

const PAGE_SIZE = 18; // 6 cols × 3 rows

const POPULAR_MODELS = [
  // Your popularity models
  "Hazel Moore", "Melanie Marie", "Isa Bella", "Eva Generosi", "Ellie Nova",
  "Lucy Mochi", "Aria Lee", "Zara", "Agatha Vega", "Angel Youngs",
  "Rikako Katayama", "Rissa May", "Eve Sweet", "Kwini Kim",
  "Angel Gostosa", "Rae Lil Black", "Britney Dutch", "Joanna Wei",
  "Catherine Knight", "Octavia Red", "Ryan Reid", "Lulu Chu",
  "Eva Elfie", "Lana Rhoades", "Dolly Orchid", "Ashley Aixi",
  "Megan Mistakes", "Liz Jordan", "Chanel Camryn", "Kelly Collins",
  "Christy White", "Freya Parker", "Vanessa Alessia", "Lilly Bell",
  "XxLayna Marie", "Bella Spark", "Ashby Winter", "Amber Moore",
  "Jazlyn Ray", "Molly Little", "Emiri Momota", "Demi Hawks",
  "Little Angel", "Jia Lissa", "Sonya Blaze", "Lily Blossom",
  "Matty Mila Perez", "Vanna Bardot", "Emily Willis",
  "Gianna Dior", "Gal Ritchie", "Jazmin Luv", "Azul Hermosa",
  "Elsa Jean", "Coco Lovelock", "Liya Silver", "Sirena Milano",
  "Tori Black", "Kendra Sunderland", "Shelena", "Kylie Rocket",
  "Alexis Tae", "Ella Hughes", "Selena Love",

  // Randomized remaining models
  "Blake Blossom", "Riley Reid", "Angela White", "Lexi Luna",
  "Eliza Ibarra", "Stella Luxx", "Chloe Surreal", "Dani Daniels",
  "Scarlett Jones", "Katana Kombat", "Violet Myers", "Reina Ohara",
  "Emma Rosie", "Avery Cristy", "Nikki Nicole", "Lia Lin",
  "Chloe Amour", "Hailey Rose", "Valentina Nappi", "Julia James",
  "Ellie Leen", "Sybil", "Kendra Spade", "Leana Lovings",
  "Scarlit Scandal", "Janice Griffith", "Abella Danger",
  "Venus Valencia", "Lana Smalls", "Jasmine Sherni",
  "Dana Vespoli", "Yhivi", "Millie Morgan", "Bailey Base",
  "Lexi Lore", "Stefany Kyler", "Scarlett Alexis",
  "Queenie Sateen", "Katie Kush", "Hime Marie",
  "Angelina Moon", "Barbie Feels", "Lexi Smith",
  "Della Cate", "Ariana Van X", "Kimmy Kimm",
  "Aria Taylor", "Shay Sights", "Ashley Alexander",
  "Brooklyn Gray", "Jadilica", "Ameena Green",
  "Little Caprice", "Hazel Heart", "Anissa Kate",
  "Cecelia Taylor", "Elly Clutch", "Violet Gems",
  "Kayley Gunner", "Cherie DeVille", "Alexia Anders",
  "Codi Vore", "Adria Rae", "Armani Black",
  "Antonella La Sirena", "Megan Longoria", "Ailee Anne"
];

const ModelCard = ({ 
  model, 
  profile, 
  latestVideo, 
  idx 
}: { 
  model: string; 
  profile: ModelProfile; 
  latestVideo?: Video; 
  idx: number;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const { toggleFavoriteModel, isModelFavorite } = useInteractions();
  const navigate = useNavigate();
  const favored = isModelFavorite(slugifyModel(model));

  const handleMouseEnter = () => {
    if (!isTouch) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleTouchStart = () => {
    setIsTouch(true);
    setIsHovered(true);
  };

  const showPreview = isHovered && latestVideo?.previewUrl;

  return (
    <Link
      to={getModelUrl(model)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      style={{ animationDelay: `${idx * 80}ms` }}
      className="group relative block overflow-hidden rounded-lg bg-[#0a0a0a] shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_60px_rgba(220,50,60,0.25)] transition-all duration-500 hover:-translate-y-2 animate-fade-in"
    >
      {/* Poster */}
      <div className="relative aspect-[9/16] overflow-hidden bg-black">
        <img
          src={profile.card}
          alt={model}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105 ${
            showPreview ? "opacity-0" : "opacity-100"
          }`}
        />
        
        {showPreview && (
          <video
            src={latestVideo.previewUrl}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover animate-in fade-in duration-500"
          />
        )}

        <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none opacity-0 group-hover:opacity-100 z-10">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white text-white transition-transform duration-500 group-hover:scale-110">
            <Play size={28} className="fill-white translate-x-1" />
          </div>
        </div>

        {/* Pixel Overlay on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.15] transition-opacity duration-500 pointer-events-none" 
             style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='4' height='4'><rect width='1' height='1' fill='white'/></svg>\")" }} />
        {/* Glow border */}
        <div className="pointer-events-none absolute inset-0 rounded-lg ring-0 group-hover:ring-1 group-hover:ring-primary/40 transition-all duration-500" />
      </div>
      {/* Bottom name bar */}
      <div className="h-[54px] flex items-center justify-between px-3.5 bg-black border-t border-white/5 relative z-20">
        <h3
          className="text-[17px] font-medium text-white tracking-wide truncate group-hover:text-primary transition-colors duration-300 flex-1"
          style={{ fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: "0.02em" }}
        >
          {model}
        </h3>
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavoriteModel(slugifyModel(model));
          }}
          className={`p-1.5 rounded-full transition-all duration-300 ${favored ? "text-primary bg-primary/10" : "text-white/20 hover:text-primary hover:bg-primary/10"}`}
        >
          <Heart size={16} className={favored ? "fill-current" : ""} />
        </button>
      </div>
    </Link>
  );
};

const Models = () => {
  const navigate = useNavigate();
  const { videos, loading: videosLoading } = useVideos();
  const { user } = useFirebase();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"Popularity" | "Name">("Popularity");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, [searchQuery, page]);

  const filteredModels = useMemo(() => {
    const supNames = supModels.map(m => m.name.toLowerCase());
    const excludedModels = new Set(supNames);
    
    let result = modelCodes.filter(m => !excludedModels.has(m.toLowerCase()));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((m) => m.toLowerCase().includes(q));
    }

    if (sortOrder === "Name") {
      result.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    } else {
      // Sort by Popularity
      result.sort((a, b) => {
        const indexA = POPULAR_MODELS.indexOf(a);
        const indexB = POPULAR_MODELS.indexOf(b);

        // If both are in the popular list, sort by their position in that list
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        
        // If only one is in the list, that one comes first
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;

        // If neither is in the list, sort them deterministically (alphabetical for "randomly arranging" effect that is stable)
        // Or if the user really wants "randomly arranging", we could use a hash of the name
        return a.toLowerCase().localeCompare(b.toLowerCase());
      });
    }

    return result;
  }, [searchQuery, sortOrder]);

  useEffect(() => { setPage(1); }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredModels.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedModels = filteredModels.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const goTo = (p: number) => {
    setPage(Math.min(Math.max(1, p), totalPages));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const modelVideoCount = useMemo(() => {
    const counts: Record<string, number> = {};
    videos.forEach((v) => {
      getVideoModels(v).forEach((m) => {
        counts[m] = (counts[m] || 0) + 1;
      });
    });
    return counts;
  }, [videos]);

  return (
    <div className="min-h-screen bg-[#050505] pb-24 md:pb-0 font-sans selection:bg-primary/30 selection:text-white relative">
      <DesktopHeader />
      <MobileHeader />

      {/* Atmosphere */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <PixelAtmosphere density={70} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(220,50,60,0.10),transparent_60%),radial-gradient(circle_at_80%_60%,rgba(255,200,120,0.06),transparent_55%)]" />
      </div>

      <div className="relative z-10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-12">
          {/* Featured Showcase - 1600x999 dimension */}
          <Link 
            to={getModelUrl("Agatha Vega")}
            className="mb-16 block relative group overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.8)]"
          >
            <div className="relative aspect-[1600/999] w-full overflow-hidden bg-black">
              <motion.div
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full w-full"
              >
                <img
                  src="https://i.ibb.co/yFX9Rhwb/rae-lil-black-agatha-vega-24-hours-part-3-vixen-01.jpg"
                  className="h-full w-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                  alt="Featured Performer"
                />
              </motion.div>
              
              <div className="absolute inset-0 p-8 sm:p-12 flex flex-col justify-end">
                <motion.div
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="space-y-4"
                >
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-primary/95 px-3 py-1 text-[10px] font-black text-primary-foreground tracking-widest uppercase mb-3 shadow-lg shadow-primary/20">
                      <Star className="h-3 w-3 fill-current" /> Performer of the Month
                    </span>
                    <h1 className="text-4xl sm:text-7xl font-black text-white tracking-tighter leading-none" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      Agatha Vega
                    </h1>
                  </div>
                  <p className="text-white/60 text-sm sm:text-lg max-w-xl font-medium tracking-wide">
                    Experience the ultimate in premium cinematic fashion and editorial storytelling with our exclusive featured performer.
                  </p>
                  <div className="flex items-center gap-4 pt-2">
                    <span className="px-8 py-3 rounded-full bg-white text-black text-xs font-bold tracking-widest group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      VIEW PROFILE
                    </span>
                    <div className="flex gap-4 text-white/40 text-[10px] font-bold tracking-widest uppercase italic">
                      <span>• {getViews("Agatha Vega featured")} VIEWS</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
            {/* Animated grain/noise */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")" }} />
          </Link>

          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex-1">
              <h2 className="text-4xl sm:text-5xl font-black text-white flex items-center gap-3 tracking-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                <Sparkles className="h-7 w-7 text-primary" />
                Pixel Performer Gallery
              </h2>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              {/* Sort Dropdown */}
              <div className="relative" ref={sortRef}>
                <button 
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="w-full sm:w-48 flex items-center justify-between px-4 py-2.5 bg-primary rounded-xl text-[10px] font-black tracking-widest text-white uppercase shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span className="mr-2">{sortOrder}</span>
                  <motion.div
                    animate={{ rotate: isSortOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {isSortOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full left-0 right-0 mt-2 z-50 bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl"
                    >
                      {(["Popularity", "Name"] as const).map((opt) => (
                        <button 
                          key={opt}
                          onClick={() => { setSortOrder(opt); setIsSortOpen(false); }}
                          className={`w-full px-4 py-3 rounded-xl text-left text-[10px] font-black tracking-widest uppercase transition-all ${
                            sortOrder === opt ? "bg-primary text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search models..."
                  className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 backdrop-blur-md transition-all"
                />
              </div>
            </div>
          </div>

          {filteredModels.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-white/70 text-lg font-medium" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                No matching performers found
              </p>
              <p className="text-white/40 text-sm mt-2">
                We couldn't find anything for "{searchQuery}". Try a different name.
              </p>
            </div>
          ) : (
          <>
          {/* Premium portrait grid: exactly 6 × 3 = 18 per page */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {loading ? (
              Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="rounded-lg overflow-hidden bg-[#0a0a0a]">
                  <Skeleton className="aspect-[9/16] w-full rounded-none" />
                  <div className="h-[54px] flex items-center px-3.5">
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))
            ) : (
              pagedModels.map((model, idx) => {
                const profile = getModelProfile(model);
                const latestVideo = videos.find(v => v.model.includes(model));
                
                return (
                  <ModelCard 
                    key={model} 
                    model={model} 
                    profile={profile} 
                    latestVideo={latestVideo} 
                    idx={idx} 
                  />
                );
              })
            )}
          </div>

          {/* Pagination */}
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goTo}
          />
          </>
          )}
        </div>

        <Footer />
      </div>
      <BottomNav />
    </div>
  );
};

export default Models;

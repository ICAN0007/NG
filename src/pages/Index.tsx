import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import {
  categories,
  modelCodes,
  filters,
  sortOptions,
  formatDuration,
  getVideoEmbedUrl,
  getVideoThumbnailUrl,
  getVideoModels,
  videoHasModel,
  slugifyModel,
  getViews,
  getThumbnailAspectRatio,
  formatDate,
  isSupVideo,
} from "@/lib/videos";
import { supModels } from "@/lib/sup-data";
import { getModelUrl } from "@/lib/model-utils";
import {
  Search, Monitor, Play, Clock, Heart, MessageSquare, Bookmark, Star, Eye, ChevronRight, Film, User, Tag, Folder, X, ArrowUpRight,
} from "lucide-react";
import Pagination from "@/components/Pagination";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/Skeleton";
import { useVideos } from "@/hooks/use-videos";
import { VideoCard } from "@/components/VideoCard";
import { TrendingVideos } from "@/components/TrendingVideos";
import { TrendingCreators } from "@/components/TrendingCreators";

import { useFirebase } from "@/context/FirebaseContext";
import { useInteractions } from "@/hooks/use-interactions";
import { logoutUser } from "@/lib/auth-service";
import { DesktopHeader, MobileHeader, BottomNav } from "@/components/Navigation";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useFirebase();
  const { toggleFavoriteModel, toggleFavoriteCategory, isModelFavorite, isCategoryFavorite } = useInteractions();
  const [searchParams, setSearchParams] = useSearchParams();
  const { videos, loading: videosLoading } = useVideos();
  const [loading, setLoading] = useState(true);
  
  const initialFilter = searchParams.get("filter") || "Homepage";
  const initialTag = searchParams.get("tag") || null;
  const initialModel = searchParams.get("model") || null;

  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [selectedModel, setSelectedModel] = useState<string | null>(initialModel);
  const [selectedTag, setSelectedTag] = useState<string | null>(initialTag);

  useEffect(() => {
    const f = searchParams.get("filter");
    setActiveFilter(f || "Homepage");
    
    const t = searchParams.get("tag");
    setSelectedTag(t || null);

    const m = searchParams.get("model");
    setSelectedModel(m || null);
  }, [searchParams]);

  const [activeTab, setActiveTab] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [supActive, setSupActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const collectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate data loading
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [activeFilter, searchQuery, selectedModel, selectedTag, currentPage]);

  const scrollToCollection = () => {
    setTimeout(() => {
      collectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  // Close search and sort dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    
    // Always exclude SUP content from global search results on the index page
    const matchedVideos = videos.filter(
      (v) => !isSupVideo(v) && (v.title.toLowerCase().includes(q) || getVideoModels(v).some((m) => m.toLowerCase().includes(q)))
    ).slice(0, 5);

    const supNames = new Set(supModels.map(m => m.name.toLowerCase()));
    const matchedModels = modelCodes.filter((m) => !supNames.has(m.toLowerCase()) && m.toLowerCase().includes(q)).slice(0, 5);
    
    const matchedCategories = categories.filter((c) => c.name.toLowerCase() !== "sup" && c.name.toLowerCase() !== "onlyfans" && c.name.toLowerCase().includes(q)).slice(0, 5);
    const allTags = [...new Set(videos.filter(v => !isSupVideo(v)).flatMap((v) => v.tags))];
    const matchedTags = allTags.filter((t) => t.toLowerCase() !== "sup" && t.toLowerCase() !== "onlyfans" && t.toLowerCase().includes(q)).slice(0, 5);
    
    return { matchedVideos, matchedModels, matchedCategories, matchedTags };
  }, [searchQuery, videos]);

  const filteredVideos = useMemo(() => {
    let result = videos;
    
    // Strictly exclude Stripchat/Sup videos from results on the Home page
    result = result.filter(v => !isSupVideo(v));

    if (selectedModel) {
      result = result.filter((v) => videoHasModel(v, selectedModel));
    }
    if (selectedTag) {
      result = result.filter((v) => v.tags.includes(selectedTag));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          getVideoModels(v).some((m) => m.toLowerCase().includes(q)) ||
          v.categories.some((c) => c.toLowerCase().includes(q)) ||
          v.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    
    // Handle special sorting
    if (activeFilter === "Top Rated") {
      // Sort by a combination of view count and ID as a proxy for rating
      return [...result].sort((a, b) => {
        const viewsA = parseInt(getViews(a.id).replace(/[kK]/g, '')) * (getViews(a.id).includes('k') ? 1000 : 1);
        const viewsB = parseInt(getViews(b.id).replace(/[kK]/g, '')) * (getViews(b.id).includes('k') ? 1000 : 1);
        return viewsB - viewsA || b.id.localeCompare(a.id);
      });
    }
    if (activeFilter === "Most Viewed") {
      return [...result].sort((a, b) => {
        const viewsA = parseInt(getViews(a.id).replace(/[kK]/g, '')) * (getViews(a.id).includes('k') ? 1000 : 1);
        const viewsB = parseInt(getViews(b.id).replace(/[kK]/g, '')) * (getViews(b.id).includes('k') ? 1000 : 1);
        return viewsB - viewsA;
      });
    }
    if (activeFilter === "Longest") {
      return [...result].sort((a, b) => {
        const getSecs = (d: string) => {
          const parts = d.split(':').map(Number);
          return parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts[0] * 60 + parts[1];
        };
        return getSecs(b.duration) - getSecs(a.duration);
      });
    }
    if (activeFilter === "Most Commented") {
      return [...result].sort((a, b) => (b.title.length % 50) - (a.title.length % 50) || b.id.localeCompare(a.id));
    }
    if (activeFilter === "Most Favorited") {
      return [...result].sort((a, b) => (b.id.length * b.title.length % 100) - (a.id.length * a.title.length % 100) || b.id.localeCompare(a.id));
    }
    if (activeFilter === "Random Videos") {
      // Semi-random deterministic sort
      return [...result].sort((a, b) => {
        const hash = (s: string) => s.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
        return hash(a.id + "seed") - hash(b.id + "seed");
      });
    }
    if (activeFilter === "Being Watched") {
      return [...result].sort((a, b) => a.duration.localeCompare(b.duration));
    }
    
    // Default: Newest Videos / Latest (descending date, then descending ID for stability)
    return [...result].sort((a, b) => {
      const dateA = new Date(a.addedAt).getTime();
      const dateB = new Date(b.addedAt).getTime();
      if (dateA !== dateB) return dateB - dateA;
      return b.id.localeCompare(a.id);
    });
  }, [selectedModel, selectedTag, activeFilter, videos, searchQuery]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [searchQuery]);

  const filteredModels = useMemo(() => {
    // Dynamically exclude Stripchat/OnlyFans models from the main sidebar
    const supNames = supModels.map(m => m.name.toLowerCase());
    const excludedModels = new Set(supNames);
    
    const baseList = modelCodes.filter(m => !excludedModels.has(m.toLowerCase()));
    
    if (!searchQuery.trim()) return baseList;
    const q = searchQuery.toLowerCase();
    return baseList.filter((m) => m.toLowerCase().includes(q));
  }, [searchQuery]);

  const VIDEOS_PER_PAGE = 10;
  const totalPages = Math.max(1, Math.ceil(filteredVideos.length / VIDEOS_PER_PAGE));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedModel, selectedTag, activeFilter]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const paginatedVideos = useMemo(() => {
    const start = (currentPage - 1) * VIDEOS_PER_PAGE;
    return filteredVideos.slice(start, start + VIDEOS_PER_PAGE);
  }, [filteredVideos, currentPage]);

  const recentPosts = useMemo(() => {
    return [...videos]
      .filter(v => !isSupVideo(v))
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
      .slice(0, 5);
  }, [videos]);

  const getCategoryCount = (catName: string) => {
    return categories.find(c => c.name === catName)?.count || 0;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-24 md:pb-0 font-sans">
      <DesktopHeader />
      <MobileHeader />

      {/* Search */}
      <div className="max-w-3xl mx-auto px-4 py-6" ref={searchRef}>
        <div className="relative">
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setSearchFocused(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                  setSearchFocused(false);
                }
              }}
              placeholder="Search videos, models, categories..."
              className="w-full rounded-full bg-secondary border border-border pl-12 pr-12 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <Monitor className="absolute right-4 h-5 w-5 text-muted-foreground" />
          </div>

          {/* Search Dropdown */}
          {searchFocused && searchResults && (
            <div className="absolute z-50 mt-2 w-full rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10 overflow-hidden">
              {/* Matched Videos */}
              {searchResults.matchedVideos.length > 0 && (
                <div className="p-3 border-b border-border">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Film className="h-3 w-3" /> Videos
                  </p>
                  {searchResults.matchedVideos.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => {
                        navigate(`/video/${v.id}`);
                        setSearchFocused(false);
                        setSearchQuery("");
                      }}
                      role="button"
                      tabIndex={0}
                      className="flex items-center gap-3 w-full px-2 py-2 rounded-lg hover:bg-primary/5 transition-colors text-left group cursor-pointer"
                    >
                      <img
                        src={getVideoThumbnailUrl(v.thumb)}
                        alt={v.title}
                        className="h-10 w-16 rounded object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">{v.title}</p>
                        <p className="text-[10px] text-muted-foreground">{v.model} • {formatDuration(v.duration)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Matched Models */}
              {searchResults.matchedModels.length > 0 && (
                <div className="p-3 border-b border-border">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <User className="h-3 w-3" /> Models
                  </p>
                  {searchResults.matchedModels.map((m) => (
                    <div
                      key={m}
                      onClick={() => {
                        setSearchParams({ model: m });
                        setSearchFocused(false);
                        setSearchQuery("");
                        scrollToCollection();
                      }}
                      role="button"
                      tabIndex={0}
                      className="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg hover:bg-primary/5 transition-colors text-left group cursor-pointer"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">
                        {m.split(" ").map(w => w[0]).join("")}
                      </span>
                      <span className="text-xs text-foreground group-hover:text-primary transition-colors">{m}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Matched Categories */}
              {searchResults.matchedCategories.length > 0 && (
                <div className="p-3 border-b border-border">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Folder className="h-3 w-3" /> Categories
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {searchResults.matchedCategories.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => {
                          setSearchParams({ filter: c.name });
                          setSearchFocused(false);
                          setSearchQuery("");
                          scrollToCollection();
                        }}
                        className="px-3 py-1.5 rounded-full bg-secondary text-[11px] font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Tags */}
              {searchResults.matchedTags.length > 0 && (
                <div className="p-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Tag className="h-3 w-3" /> Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {searchResults.matchedTags.map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setSearchParams({ tag: t });
                          setSearchFocused(false);
                          setSearchQuery("");
                          scrollToCollection();
                        }}
                        className="px-3 py-1.5 rounded-full bg-primary/10 text-[11px] font-semibold text-primary hover:bg-primary/20 transition-colors"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No results */}
              {searchResults.matchedVideos.length === 0 &&
                searchResults.matchedModels.length === 0 &&
                searchResults.matchedCategories.length === 0 &&
                searchResults.matchedTags.length === 0 && (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No results found for "{searchQuery}"
                </div>
              )}

              <Link
                to={`/search?q=${encodeURIComponent(searchQuery.trim())}`}
                onClick={() => setSearchFocused(false)}
                className="block w-full py-3 bg-primary/5 hover:bg-primary/10 border-t border-border text-center text-[10px] font-black text-primary tracking-[0.2em] uppercase transition-all"
              >
                View Results in Vault <ArrowUpRight size={14} className="inline ml-1" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-5xl mx-auto px-4 pb-4">
        <div className="flex flex-wrap justify-center gap-2">
          {filters.map((f) =>
            f === "Models" ? (
              <Link
                key={f}
                to="/models"
                className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 bg-secondary text-secondary-foreground hover:bg-muted"
              >
                {f}
              </Link>
            ) : f === "Categories" ? (
              <button
                key={f}
                onClick={() => {
                  const el = document.getElementById("categories-section");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                    // Optionally set the filter too if we want it active
                    setSearchParams({ filter: f });
                  }
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
                  activeFilter === f
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
              >
                {f}
              </button>
            ) : (
              <button
                key={f}
                onClick={() => {
                  setSearchParams({ filter: f });
                  scrollToCollection();
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
                  activeFilter === f
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
              >
                {f}
              </button>
            )
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col lg:flex-row gap-12">
        {/* Left: Featured + Grid */}
        <div className="flex-1 min-w-0 scroll-mt-24">

          {/* Premium Collection */}
          <section ref={collectionRef} className="scroll-mt-4">
            
            {/* Telegram Promo Banner - Precise Editorial Redesign */}
            <div className="mb-10 md:mb-20 w-full max-w-[1090px] h-[300px] md:h-[338px] rounded-[24px] md:rounded-[32px] border border-white/10 relative overflow-hidden group shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)] flex items-end justify-start">
              {/* Background Image */}
              <div className="absolute inset-0 z-0">
                <img 
                  src="https://www.porn-star.com/artwork/vixen-eve_sweet4-1090338.jpg" 
                  alt="Official Telegram Background" 
                  className="w-full h-full object-cover object-[center_30%] group-hover:scale-105 transition-transform duration-[3000ms] ease-out"
                  referrerPolicy="no-referrer"
                />
                {/* Polished Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-[1]" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent hidden md:block z-[1]" />
              </div>

              {/* Content Overlay */}
              <div className="relative z-10 w-full md:max-w-xl p-8 md:p-14">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="space-y-4"
                >
                  <div className="space-y-2 md:space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-[2px] w-6 bg-[#229ED9]" />
                      <span className="text-[9px] font-black tracking-[0.4em] text-[#229ED9] uppercase">OFFICIAL CHANNEL</span>
                    </div>
                    
                    <div className="space-y-1">
                      <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase italic">
                        VAULT <span className="text-[#229ED9] not-italic">TELEGRAM</span>
                      </h2>
                      <p className="text-[10px] md:text-sm font-bold text-white/70 tracking-tight uppercase italic">
                        Join for daily newest releases & exclusive updates
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <a 
                      href="https://t.me/Vibevault_18" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="group/btn relative px-6 py-3 bg-[#229ED9] hover:bg-[#1d8cc2] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl transition-all border border-white/20 overflow-hidden flex items-center gap-2"
                    >
                      JOIN <ArrowUpRight size={12} />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                    </a>
                    <a 
                      href="https://t.me/ElitePleasureClips" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="px-5 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      ELITE
                    </a>
                  </div>
                </motion.div>
              </div>
              
              {/* Vertical Side Label - Hidden on Mobile */}
              <div className="hidden md:flex absolute right-0 top-0 bottom-0 w-10 border-l border-white/5 items-center justify-center p-4">
                <span className="rotate-90 whitespace-nowrap text-[8px] font-black tracking-[1em] text-white/10 uppercase">
                  VAULT
                </span>
              </div>
            </div>


            <div className="mb-8 md:mb-12">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 md:mb-10">
                <h3 className="text-lg sm:text-2xl font-black tracking-[0.2em] uppercase text-white whitespace-nowrap italic">
                  {(activeFilter === "Homepage" || activeFilter === "Newest Videos" || activeFilter === "Latest" || activeFilter === "Most Viewed" || activeFilter === "Top Rated" || activeFilter === "Longest" || activeFilter === "Most Commented" || activeFilter === "Most Favorited" || activeFilter === "Random Videos") ? "NEWEST VIDEOS" : activeFilter.toUpperCase()}
                  <span className="block h-1 w-12 bg-primary mt-2 md:hidden" />
                </h3>

                <div className="relative shrink-0 flex items-center gap-3" ref={sortRef}>
                  <div className="md:hidden flex h-10 items-center justify-center bg-white/5 border border-white/10 rounded-xl px-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    SORT BY
                  </div>
                  <button
                    onClick={() => setSortOpen(!sortOpen)}
                    className="flex-1 sm:flex-none flex items-center justify-between gap-3 px-5 py-2.5 bg-primary rounded-xl text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap"
                  >
                    <span>
                      {["Homepage", "Newest Videos", "Latest", ""].includes(activeFilter) 
                        ? "Latest Releases" 
                        : sortOptions.includes(activeFilter) ? activeFilter : "Sort Videos"}
                    </span>
                    <motion.div
                      animate={{ rotate: sortOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="h-3 w-3 rotate-90" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {sortOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 z-[60] w-56 bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2"
                      >
                        {sortOptions.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => {
                              setSearchParams({ filter: opt });
                              setSortOpen(false);
                              scrollToCollection();
                            }}
                            className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                              (activeFilter === opt || (opt === "Latest" && (activeFilter === "Homepage" || activeFilter === "Newest Videos" || activeFilter === "")))
                                ? "bg-primary text-white"
                                : "text-white/60 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {(selectedModel || selectedTag) && (
              <div className="mb-8 flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0">
                    Filtered by
                  </span>
                  <span className="text-sm font-bold text-primary truncate">
                    {selectedModel ?? selectedTag}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSearchParams({});
                    setSelectedModel(null);
                    setSelectedTag(null);
                  }}
                  className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary hover:bg-primary/20 transition-colors shrink-0"
                >
                  <X className="h-3 w-3" /> Clear
                </button>
              </div>
            )}

            <div className="grid gap-8 grid-cols-1">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-border overflow-hidden">
                    <Skeleton className="aspect-video w-full rounded-none" />
                    <div className="p-5 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                paginatedVideos.map((video) => (
                  <VideoCard key={video.id} video={video} formatDate={formatDate} />
                ))
              )}
            </div>
          </section>

          {/* Pagination */}
          <div className="mt-6 py-6 border-t border-border/30">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => {
                setCurrentPage(p);
                collectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            />
          </div>

          {/* Recent/Search Tabs */}
          <section className="mt-12 border-t border-border/30 pt-8">
            <div className="flex gap-6 border-b border-border pb-2">
              {[
                { key: "recent", label: "RECENT POSTS" },
                { key: "searches", label: "RECENT SEARCHES" },
                { key: "popular", label: "POPULAR SEARCHES" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`text-xs font-semibold tracking-wider pb-2 transition-all border-b-2 ${
                    activeTab === tab.key
                      ? "text-primary border-primary"
                      : "text-muted-foreground border-transparent hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="py-4 space-y-2">
              {activeTab === "recent" ? (
                recentPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => navigate(`/video/${post.id}`)}
                    className="flex items-center gap-4 p-2 rounded-xl hover:bg-secondary/50 transition-all text-left group w-full cursor-pointer"
                  >
                    <div className="h-12 w-20 rounded-lg overflow-hidden shrink-0 border border-border/50">
                      <img
                        src={getVideoThumbnailUrl(post.thumb)}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-2 w-2" />
                          {formatDate(post.addedAt)}
                        </span>
                        <span className="text-[9px] text-muted-foreground">•</span>
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          {getVideoModels(post).map((m, mIdx, mArr) => (
                            <span key={m} className="flex items-center gap-1">
                              <Link 
                                to={getModelUrl(m)}
                                onClick={(e) => e.stopPropagation()}
                                className="text-[9px] text-primary/80 font-bold hover:text-primary hover:underline whitespace-nowrap"
                              >
                                {m}
                              </Link>
                              {mIdx < mArr.length - 1 && <span className="text-[8px] text-muted-foreground">/</span>}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No {activeTab === "searches" ? "recent searches" : "popular searches"} recorded yet.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Sidebar */}
        <aside className="w-full lg:w-80 shrink-0 space-y-8">
          
          {/* Telegram Sidebar Section */}
          <div className="rounded-2xl bg-gradient-to-br from-[#229ED9]/10 to-transparent border border-white/5 p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#229ED9] rounded-xl flex items-center justify-center shadow-lg shadow-[#229ED9]/20">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-black tracking-wider text-white uppercase italic">Join Us</h3>
            </div>
            <p className="text-[11px] text-[#9ca3af] leading-relaxed font-bold">
              Stay updated with the newest releases and community discussions.
            </p>
            <div className="space-y-2.5">
              <a 
                href="https://t.me/Vibevault_18" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-3 bg-[#229ED9] hover:bg-[#229ED9]/90 text-white rounded-xl transition-all group"
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Vibe Vault 18+</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
              <a 
                href="https://t.me/ElitePleasureClips" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-all group"
              >
                <span className="text-[10px] font-black uppercase tracking-widest">Elite Pleasure</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div id="categories-section" className="rounded-2xl border border-border bg-card p-5">
            <h3 
              onClick={() => {
                setSearchParams({ filter: "NAKED GIRLS" });
                scrollToCollection();
              }}
              className="text-sm font-bold tracking-wider text-foreground mb-4 uppercase flex items-center gap-2 cursor-pointer hover:text-primary transition-colors group"
            >
              <span className="h-5 w-1 rounded-full bg-primary group-hover:scale-y-125 transition-transform" />
              NAKED GIRLS
            </h3>
            <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
              {loading ? (
                Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))
              ) : (
                filteredCategories.map((cat) => {
                  const isActive = activeFilter === cat.name;
                  return (
                    <div
                      key={cat.name}
                      onClick={(e) => {
                        e.preventDefault();
                        setSearchParams({ filter: cat.name });
                        scrollToCollection();
                      }}
                      className={`group relative rounded-xl border px-3 py-3 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 overflow-hidden text-left cursor-pointer ${
                        isActive
                          ? "bg-primary/10 border-primary/30"
                          : "bg-secondary/50 border-border/50"
                      }`}
                    >
                      <span className={`block text-[11px] font-semibold truncate transition-colors ${
                        isActive ? "text-primary" : "text-foreground group-hover:text-primary"
                      }`}>
                        {cat.name}
                      </span>
                      <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavoriteCategory(cat.name);
                            }}
                            className={`p-1 rounded-full transition-all ${
                              isCategoryFavorite(cat.name) 
                                ? "text-primary bg-primary/10" 
                                : "text-white/10 hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100"
                            }`}
                          >
                            <Bookmark size={10} className={isCategoryFavorite(cat.name) ? "fill-current" : ""} />
                          </button>
                          {isActive && !isCategoryFavorite(cat.name) && (
                            <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1" />
                          )}
                        </div>
                        {isCategoryFavorite(cat.name) && (
                          <Link 
                            to="/library" 
                            onClick={(e) => e.stopPropagation()}
                            className="text-[8px] font-black text-primary/60 hover:text-primary transition-colors uppercase pr-1"
                          >
                            Library
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Models */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-sm font-bold tracking-wider text-foreground mb-4 uppercase flex items-center gap-2">
              <span className="h-5 w-1 rounded-full bg-primary" />
              Models
            </h3>
            <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
              {selectedModel && (
                <button
                  onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), model: "" })}
                  className="mb-2 w-full text-[10px] font-semibold text-primary hover:text-primary/80 transition-colors text-left px-3"
                >
                  ✕ Clear filter: {selectedModel}
                </button>
              )}
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-xl mb-1" />
                ))
              ) : (
                filteredModels.map((model) => {
                  const isSelected = selectedModel === model;
                  return (
                    <div
                      key={model}
                      onClick={() => {
                        if (isSelected) {
                          const newParams = Object.fromEntries(searchParams);
                          delete newParams.model;
                          setSearchParams(newParams);
                        } else {
                          setSearchParams({ ...Object.fromEntries(searchParams), model });
                          scrollToCollection();
                        }
                      }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium w-full transition-all duration-200 group cursor-pointer ${
                        isSelected
                          ? "bg-primary/10 text-primary border border-primary/30"
                          : "text-muted-foreground hover:text-foreground hover:bg-primary/5 border border-transparent"
                      }`}
                    >
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold shrink-0 border transition-all duration-300 ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-gradient-to-br from-primary/20 to-primary/5 text-primary border-primary/20 group-hover:from-primary group-hover:to-primary/80 group-hover:text-primary-foreground group-hover:border-primary"
                      }`}>
                        {model.split(" ").map(w => w[0]).join("")}
                      </span>
                      <span className="truncate transition-colors">{model}</span>
                      <div className="ml-auto flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavoriteModel(slugifyModel(model));
                            }}
                            className={`p-1.5 rounded-full transition-all ${
                              isModelFavorite(slugifyModel(model)) 
                                ? "text-primary bg-primary/10" 
                                : "text-white/10 hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100"
                            }`}
                          >
                            <Heart size={12} className={isModelFavorite(slugifyModel(model)) ? "fill-current" : ""} />
                          </button>
                          <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                        </div>
                        {isModelFavorite(slugifyModel(model)) && (
                          <Link 
                            to="/library" 
                            onClick={(e) => e.stopPropagation()}
                            className="text-[8px] font-black text-primary/60 hover:text-primary transition-colors uppercase pr-3"
                          >
                            Library
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Trending Videos Section */}
          <TrendingVideos videos={videos} />

          {/* Trending Creators Section */}
          <div className="mt-12">
            <TrendingCreators />
          </div>
        </aside>
      </div>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Index;

import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState, useRef } from "react";
import { motion } from "motion/react";
import { 
  channels,
  modelCodes, 
  modelProfiles, 
  slugifyModel, 
  getVideoModels,
  formatDuration, 
  getVideoEmbedUrl,
  videoHasModel,
  getViews,
  getThumbnailAspectRatio,
  Video,
  sortOptions
} from "@/lib/videos";
import { isSupModel } from "@/lib/model-utils";
import { supModels, SupModel, SupClip } from "@/lib/sup-data";
import { useVideos } from "@/hooks/use-videos";
import { useInteractions } from "@/hooks/use-interactions";
import { useFirebase } from "@/context/FirebaseContext";
import { logoutUser } from "@/lib/auth-service";
import { 
  ChevronLeft, 
  Play, 
  Star, 
  Heart, 
  Share2, 
  Users, 
  Eye, 
  Clock, 
  CheckCircle2,
  ChevronRight,
  X,
  ArrowLeft,
  Smartphone,
  FileImage,
  Video as VideoIcon
} from "lucide-react";
import { useCallback } from "react";
import { AnimatePresence } from "motion/react";
import { DesktopHeader, MobileHeader, BottomNav } from "@/components/Navigation";
import PixelAtmosphere from "@/components/PixelAtmosphere";
import { VideoListCard } from "@/components/VideoListCard";
import { ClipCard } from "@/components/ClipCard";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/Skeleton";

const LatestSceneBanner = ({ video }: { video: Video }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

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

  const showPreview = isHovered && video.previewUrl;

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      className="mb-16 group relative w-full aspect-[744.626/417.352] rounded-3xl overflow-hidden border border-white/10 bg-black cursor-pointer"
      onClick={() => navigate(`/video/${video.id}`)}
    >
      <img 
        src={video.thumb} 
        alt="Latest Scene"
        loading="lazy"
        onContextMenu={(e) => e.preventDefault()}
        className={`w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-105 ${
          showPreview ? "opacity-0" : "opacity-100"
        }`}
      />

      {showPreview && (
        <video
          src={video.previewUrl}
          autoPlay
          muted
          loop
          playsInline
          onContextMenu={(e) => e.preventDefault()}
          className="absolute inset-0 h-full w-full object-cover animate-in fade-in duration-500"
        />
      )}
      
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-6">
        <div className="h-24 w-24 flex items-center justify-center rounded-full border-2 border-white text-white scale-90 group-hover:scale-110 transition-transform duration-700 mb-4">
          <Play size={48} className="fill-current translate-x-1.5" />
        </div>
        <div className="space-y-2">
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-primary/80">Latest Scene</span>
          <h3 className="text-3xl sm:text-6xl font-black tracking-tighter max-w-4xl" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {video.title}
          </h3>
        </div>
        
        <button className="px-12 py-4 bg-transparent border border-white/20 text-white rounded-none font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-500">
          WATCH NOW
        </button>
      </div>

      {/* Views/Stats overlay */}
      <div className="absolute bottom-8 left-8 flex items-center gap-6 text-[10px] font-black tracking-widest uppercase text-white/40">
        <span className="flex items-center gap-2"><Eye className="h-4 w-4" /> {getViews(video.id)}</span>
        <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {formatDuration(video.duration)}</span>
        <span className="px-3 py-1 bg-white/10 rounded-full border border-white/5">Ultra 4K</span>
      </div>
    </motion.div>
  );
};

const ModelProfile = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { videos, allVideos, loading: videosLoading } = useVideos();
  const { user } = useFirebase();
  const { toggleFavoriteModel, isModelFavorite } = useInteractions();
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("Latest");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const [channelFilter, setChannelFilter] = useState("");
  const [activeTab, setActiveTab] = useState<'videos' | 'photos' | 'clips'>('videos');
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [selectedClipIndex, setSelectedClipIndex] = useState<number | null>(null);
  const [galleryClip, setGalleryClip] = useState<SupClip | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const allModelCodes = useMemo(() => {
    const fromVideos = allVideos?.flatMap(v => getVideoModels(v)) || [];
    const supNames = supModels.map(m => m.name);
    return Array.from(new Set([...modelCodes, ...fromVideos, ...supNames]));
  }, [allVideos]);

  const modelName = useMemo(() => {
    if (!slug) return undefined;
    return allModelCodes.find(m => slugifyModel(m) === slug);
  }, [slug, allModelCodes]);

  const isSup = useMemo(() => modelName ? isSupModel(modelName) : false, [modelName]);

  // Redirect logic for URL consistency
  useEffect(() => {
    if (!modelName || !slug) return;
    
    const isActuallySup = isSupModel(modelName);
    const isSupRoute = location.pathname.startsWith('/SUP/');
    const isModelsRoute = location.pathname.startsWith('/models/');
    
    if (isActuallySup && isModelsRoute) {
      navigate(`/SUP/${slug}`, { replace: true });
    } else if (!isActuallySup && isSupRoute) {
      navigate(`/models/${slug}`, { replace: true });
    }
  }, [modelName, location.pathname, navigate, slug]);

  const supMemberData = useMemo(() => {
    if (!isSup || !modelName) return null;
    return (supModels as unknown as SupModel[]).find(m => m.name === modelName);
  }, [isSup, modelName]);

  const allClips = useMemo(() => supMemberData?.clips || [], [supMemberData]);
  const allPhotos = useMemo(() => {
    const basePhotos = supMemberData?.photos || [];
    const clipPhotos = supMemberData?.clips?.flatMap((c: string | SupClip | null | undefined) => {
      if (!c) return [];
      if (typeof c === 'string') {
        return (c || "").toLowerCase().includes('.mp4') ? [] : [c];
      }
      return (c.urls || []).filter((u: string) => !(u || "").toLowerCase().includes('.mp4'));
    }) || [];
    return Array.from(new Set([...basePhotos, ...clipPhotos]));
  }, [supMemberData]);
  
  const favored = modelName ? isModelFavorite(slugifyModel(modelName)) : false;

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, [slug]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Keyboard navigation for photo lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhoto === null) return;
      
      if (e.key === "ArrowLeft") {
        setSelectedPhoto((prev) => (prev !== null ? (prev - 1 + allPhotos.length) % allPhotos.length : null));
      } else if (e.key === "ArrowRight") {
        setSelectedPhoto((prev) => (prev !== null ? (prev + 1) % allPhotos.length : null));
      } else if (e.key === "Escape") {
        setSelectedPhoto(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhoto, allPhotos.length]);

  const profile = useMemo(() => {
    if (!modelName) return null;
    
    // Check main profiles
    if (modelProfiles[modelName]) return modelProfiles[modelName];
    
    // Check Sup/Stripchat members
    if (supMemberData) {
      return {
        image: supMemberData.image,
        portrait: supMemberData.portrait || supMemberData.image,
        hero: (supMemberData.banner?.url) || supMemberData.image,
        bio: supMemberData.bio || `${modelName} is an exclusive creator. Enjoy their latest scenes and collections updated regularly.`
      };
    }
    
    return null;
  }, [modelName, supMemberData]);

  const modelVideos = useMemo(() => {
    if (!modelName) return [];
    
    let result = (allVideos || []).filter(v => videoHasModel(v, modelName));
    
    // Explicitly add videos from supMemberData if they aren't already included
    if (supMemberData?.videos) {
      const supVideos = supMemberData.videos.map(v => ({
        ...v,
        model: v.model || modelName,
        isSup: true,
        addedAt: v.addedAt || new Date().toISOString()
      }));
      
      supVideos.forEach(sv => {
        if (!result.find(r => r.id === sv.id)) {
          result.push(sv as Video);
        }
      });
    }

    if (channelFilter && channelFilter !== "All") {
      result = result.filter(v => v.channel.some(c => c.toLowerCase() === channelFilter.toLowerCase()));
    }

    if (sortBy === "Top Rated") {
      return [...result].sort((a, b) => {
        const getV = (id: string) => {
          try {
            const v = getViews(id);
            if (!v) return 0;
            return parseInt(v.replace(/[kK]/g, '')) * (v.toLowerCase().includes('k') ? 1000 : 1);
          } catch {
            return 0;
          }
        };
        const viewsA = getV(a.id);
        const viewsB = getV(b.id);
        return viewsB - viewsA || b.id.localeCompare(a.id);
      });
    }
    if (sortBy === "Most Viewed") {
      return [...result].sort((a, b) => {
        const getV = (id: string) => {
          try {
            const v = getViews(id);
            if (!v) return 0;
            return parseInt(v.replace(/[kK]/g, '')) * (v.toLowerCase().includes('k') ? 1000 : 1);
          } catch {
            return 0;
          }
        };
        const viewsA = getV(a.id);
        const viewsB = getV(b.id);
        return viewsB - viewsA;
      });
    }
    if (sortBy === "Longest") {
      return [...result].sort((a, b) => {
        const getSecs = (d: string | undefined) => {
          if (!d) return 0;
          const parts = d.split(':').map(Number);
          return parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts[0] * 60 + (parts[1] || 0);
        };
        return getSecs(b.duration) - getSecs(a.duration);
      });
    }
    if (sortBy === "Most Commented") {
      return [...result].sort((a, b) => ((b.title?.length || 0) % 50) - ((a.title?.length || 0) % 50) || b.id.localeCompare(a.id));
    }
    if (sortBy === "Most Favorited") {
      return [...result].sort((a, b) => ((b.id.length * (b.title?.length || 0)) % 100) - ((a.id.length * (a.title?.length || 0)) % 100) || b.id.localeCompare(a.id));
    }
    if (sortBy === "Random Videos") {
      return [...result].sort((a, b) => {
        const hash = (s: string | undefined) => (s || '').split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
        return hash(a.id + "model-seed") - hash(b.id + "model-seed");
      });
    }

    // Default: Newest / Latest
    return result.sort((a, b) => {
      const dateA = a.addedAt ? new Date(a.addedAt).getTime() : 0;
      const dateB = b.addedAt ? new Date(b.addedAt).getTime() : 0;
      if (dateA !== dateB) return dateB - dateA;
      return b.id.localeCompare(a.id);
    });
  }, [modelName, allVideos, sortBy, channelFilter, supMemberData]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!modelName || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Model not found</h2>
          <Link to="/models" className="text-primary hover:underline">Back to Gallery</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white relative pb-24 md:pb-0">
      <div className="pointer-events-none fixed inset-0 z-0">
        <PixelAtmosphere density={40} />
      </div>

      <DesktopHeader />
      <MobileHeader />

      <div className="relative z-20 max-w-[1600px] mx-auto px-4 sm:px-12 pt-8 sm:pt-12">
        {/* Navigation / Back Button */}
        <div className="flex items-center gap-6 mb-12">
          <button 
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/30 px-6 py-3 rounded-2xl transition-all duration-300"
          >
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
              <ChevronLeft size={18} />
            </div>
            <span className="text-xs font-black tracking-[0.2em] text-white/60 group-hover:text-white uppercase">
              Go Back
            </span>
          </button>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        {/* Hero Section - 744.626x310.252 */}
        {!isSup && (
          <section className="relative w-full aspect-[16/9] sm:aspect-[744.626/310.252] overflow-hidden bg-black rounded-3xl mb-12">
            {loading ? (
              <Skeleton className="w-full h-full rounded-none" />
            ) : (
              <motion.div 
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full w-full"
              >
                <img 
                  src={profile.hero || profile.image} 
                  alt={modelName}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-[3000ms]"
                />
              </motion.div>
            )}
          </section>
        )}

        {/* Model Portrait & Info Split - Matching Screenshot Style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16 items-start mb-24">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[1900/1300] sm:aspect-[1900/1300] overflow-hidden bg-[#111]">
              {loading ? (
                <Skeleton className="w-full h-full rounded-none" />
              ) : (
                <img 
                  src={profile.portrait || profile.image} 
                  alt={`${modelName} portrait`}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="pt-4 lg:pt-0"
          >
            {loading ? (
              <div className="space-y-6">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : (
              <div className="space-y-8">
                <div>
                  <div className="border-t border-white/20 pt-4" />
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
                    {modelName}
                  </h2>
                  <div className="border-b border-white/20 pb-4" />
                  
                  <div className="mt-8">
                    <p className="text-lg sm:text-xl text-gray-200 leading-[1.6] font-normal whitespace-pre-line">
                      {profile.bio}
                    </p>
                  </div>
                </div>

                <div className="pt-8 flex flex-wrap gap-4">
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => modelName && toggleFavoriteModel(slugifyModel(modelName))}
                      className={`px-8 py-3 font-bold tracking-wider uppercase transition-all text-sm border ${
                        favored 
                          ? "bg-primary text-white border-primary" 
                          : "bg-white text-black hover:bg-white/90"
                      }`}
                    >
                      {favored ? "Following Performer" : "Follow Performer"}
                    </button>
                    {favored && (
                      <Link to="/library" className="text-[10px] font-black tracking-widest text-primary hover:text-white transition-colors uppercase text-center">
                        View in Library
                      </Link>
                    )}
                  </div>
                  <button 
                    onClick={() => modelName && toggleFavoriteModel(slugifyModel(modelName))}
                    className={`px-8 py-3 rounded-none font-bold tracking-wider uppercase transition-all text-sm border ${
                      favored 
                        ? "bg-primary text-white border-primary shadow-[0_8px_16px_-4px_rgba(255,51,102,0.3)]" 
                        : "bg-transparent border-white/20 text-white hover:bg-white/10"
                    }`}
                  >
                    {favored ? "ADDED TO FAVORITES" : "FAVORITE"}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* SUP Style Tabs */}
        {isSup && (
          <div className="mb-12 flex items-center gap-8 border-b border-white/5 pb-1 overflow-x-auto no-scrollbar">
            {[
              { id: 'videos', label: 'Videos', icon: VideoIcon },
              { id: 'photos', label: 'Photos', icon: FileImage },
              { id: 'clips', label: 'Short Clips', icon: Smartphone }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'videos' | 'photos' | 'clips')}
                className={`flex items-center gap-2 pb-3 text-sm font-bold tracking-tight transition-all relative whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'text-white' 
                    : 'text-white/30 hover:text-white/50'
                } ${tab.id === 'photos' ? '!text-primary' : ''}`}
              >
                <tab.icon size={18} className={activeTab === tab.id ? "text-white" : tab.id === 'photos' ? "text-primary" : ""} />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="modelProfileTabUnderline"
                    className={`absolute bottom-0 left-0 right-0 h-[2px] ${tab.id === 'photos' ? 'bg-primary' : 'bg-white'}`}
                  />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Layout with Content and Sidebar */}
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="flex-1 min-w-0 w-full">
            {/* Tab Content */}
            {activeTab === 'videos' ? (
              <section className="mb-24">
                {/* Latest Scene Section */}
                {modelVideos.length > 0 && (
                  <>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-2xl font-black tracking-tighter text-white uppercase">
                          {isSup ? "Videos & Performances" : "Latest Scenes"}
                        </h3>
                        <div className="h-1 w-12 bg-primary rounded-full" />
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="relative shrink-0" ref={sortRef}>
                           <button
                            onClick={() => setSortOpen(!sortOpen)}
                            className="flex items-center gap-3 px-4 py-2 bg-primary rounded-xl text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap"
                          >
                            <span>{sortBy}</span>
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
                                      setSortBy(opt);
                                      setSortOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                      sortBy === opt
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

                    {/* Featured Latest Scene Banner - Only for non-SUP */}
                    {!loading && !isSup && (
                      <LatestSceneBanner video={modelVideos[0]} />
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="space-y-4">
                            <Skeleton className="aspect-video w-full rounded-xl" />
                            <div className="space-y-2">
                              <Skeleton className="h-5 w-3/4" />
                              <Skeleton className="h-3 w-1/3" />
                            </div>
                          </div>
                        ))
                      ) : (
                        (isSup ? modelVideos : modelVideos.slice(1)).map((video) => (
                          <VideoListCard key={video.id} video={video} />
                        ))
                      )}
                    </div>
                  </>
                )}
              </section>
            ) : activeTab === 'photos' ? (
              <section className="mb-24">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
                  {allPhotos.map((photo, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      onClick={() => setSelectedPhoto(idx)}
                      className="aspect-[3/4] rounded-2xl overflow-hidden border border-white/5 bg-white/5 relative group cursor-pointer"
                    >
                      <img 
                        src={photo} 
                        alt={`Photo ${idx + 1}`} 
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  ))}
                </div>
                {allPhotos.length === 0 && (
                  <div className="py-20 text-center">
                    <p className="text-white/20 font-black uppercase tracking-widest">No photos available yet</p>
                  </div>
                )}
              </section>
            ) : (
              <section className="mb-24">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {allClips.map((clipItem: string | SupClip, idx: number) => {
                    const isObject = typeof clipItem !== 'string';
                    const clip = isObject ? clipItem : {
                      title: `${modelName} Clip ${idx + 1}`,
                      url: clipItem,
                      thumbnail: clipItem
                    } as SupClip;

                    return (
                      <ClipCard 
                        key={idx}
                        clip={clip}
                        onClick={() => {
                          if (isObject && clipItem.urls && clipItem.urls.length > 1) {
                            setGalleryClip(clipItem);
                          } else {
                            setGalleryIndex(0);
                            setSelectedClipIndex(idx);
                          }
                        }}
                      />
                    );
                  })}
                </div>
                {allClips.length === 0 && (
                  <div className="py-20 text-center">
                    <p className="text-white/20 font-black uppercase tracking-widest">No short clips available yet</p>
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Right Sidebar */}
          <aside className="w-full lg:w-[350px] shrink-0 sticky top-32">
            {/* Additional info or ads could go here */}
            <div className="mt-8 p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-primary/10 to-transparent">
              <h4 className="text-sm font-black uppercase tracking-widest mb-2 italic">Creator Perks</h4>
              <p className="text-[10px] text-white/40 leading-relaxed font-bold tracking-tight uppercase">
                Follow your favorite creators to get notified when they upload new exclusive content and go live.
              </p>
            </div>
          </aside>
        </div>

        {/* Modals for Photos and Clips */}
        <AnimatePresence>
          {selectedPhoto !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPhoto(null)}
              className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 md:p-12"
            >
              <div className="absolute top-6 left-6 z-[160] flex items-center gap-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedPhoto(null); }}
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10"
                >
                  <ArrowLeft size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Back to Profile</span>
                </button>
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedPhoto(null); }}
                className="absolute top-6 right-6 text-white/60 hover:text-white z-[160] transition-colors bg-white/5 hover:bg-white/10 p-3 rounded-full"
              >
                 <X size={32} />
              </button>

              {/* Navigation Buttons */}
              {allPhotos.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPhoto((prev) => (prev !== null ? (prev - 1 + allPhotos.length) % allPhotos.length : null));
                    }}
                    className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/60 hover:text-white z-[160] bg-white/5 hover:bg-white/10 p-4 rounded-full transition-all group"
                  >
                    <ChevronLeft size={48} className="group-hover:scale-110 transition-transform" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPhoto((prev) => (prev !== null ? (prev + 1) % allPhotos.length : null));
                    }}
                    className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/60 hover:text-white z-[160] bg-white/5 hover:bg-white/10 p-4 rounded-full transition-all group"
                  >
                    <ChevronRight size={48} className="group-hover:scale-110 transition-transform" />
                  </button>
                  
                  {/* Photo Counter */}
                  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/40 font-mono text-sm tracking-[0.5em] bg-white/5 px-6 py-3 rounded-full backdrop-blur-md border border-white/5 z-[160] uppercase">
                    {(selectedPhoto + 1).toString().padStart(2, '0')} <span className="text-white/10 mx-2">/</span> {allPhotos.length.toString().padStart(2, '0')}
                  </div>
                </>
              )}

              <motion.img 
                key={selectedPhoto}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                src={allPhotos[selectedPhoto]} 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedClipIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 md:p-8"
              onClick={() => setSelectedClipIndex(null)}
            >
              <div className="absolute top-6 left-6 z-[160] flex items-center gap-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedClipIndex(null); }}
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10"
                >
                  <ArrowLeft size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Back to Profile</span>
                </button>
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedClipIndex(null); }}
                className="absolute top-6 right-6 z-[160] text-white/60 hover:text-white bg-white/5 hover:bg-white/10 p-3 rounded-full transition-colors"
              >
                <X size={32} />
              </button>
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-full max-w-md aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                {(() => {
                  const clip = allClips[selectedClipIndex];
                  const url = typeof clip === 'string' ? clip : clip.url;
                  const isVideo = url.toLowerCase().includes('.mp4');
                  return isVideo ? (
                    <video src={url} autoPlay controls className="w-full h-full object-contain" />
                  ) : (
                    <img src={url} className="w-full h-full object-contain" />
                  );
                })()}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {galleryClip && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed inset-0 z-[150] bg-black overflow-y-auto"
            >
              <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-2xl border-b border-white/5 px-4 h-16 flex items-center justify-between">
                <button onClick={() => setGalleryClip(null)} className="flex items-center gap-2 text-white/70">
                  <ArrowLeft size={18} /> Back
                </button>
                <div className="text-center flex-1">
                  <h2 className="text-[11px] font-black uppercase text-white/90">{galleryClip.title}</h2>
                </div>
                <div className="w-10" />
              </div>
              <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
                {galleryClip.urls?.map((url: string, idx: number) => (
                  <div key={idx} className="relative aspect-[9/16] sm:aspect-video rounded-3xl overflow-hidden bg-zinc-950 border border-white/5">
                    {url.toLowerCase().includes('.mp4') ? (
                      <video src={url} className="w-full h-full object-contain" controls playsInline loop />
                    ) : (
                      <img src={url} className="w-full h-full object-contain" />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Twitter Follow Section - Agatha Vega Specific */}
        {modelName === "Agatha Vega" && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-24 mb-16 px-4 md:px-0"
          >
            <div className="space-y-1">
              <a 
                href="https://x.com/agathavegaaofc" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#3ba1da] hover:text-[#4db1eb] transition-colors text-2xl md:text-3xl font-medium block tracking-tight"
              >
                Follow Agatha Vega on Twitter
              </a>
              <a 
                href="https://x.com/agathavegaaofc" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-white/80 transition-colors text-2xl md:text-3xl font-medium block tracking-tight"
              >
                @agathavegaaofc
              </a>
              
              <div className="pt-10">
                <p className="text-white/40 text-base font-medium">
                  Tweets by @agathavegaaofc
                </p>
              </div>
            </div>
          </motion.section>
        )}
      </div>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default ModelProfile;

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  channels,
  getVideoEmbedUrl,
  getVideoThumbnailUrl,
  formatDuration,
  getVideoModels,
  slugifyModel,
  getThumbnailAspectRatio,
  Video,
  videoHasModel,
} from "@/lib/videos";
import { isSupVideo } from "@/lib/sup-data";
import { getModelUrl } from "@/lib/model-utils";
import {
  Clock,
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  Play,
  ArrowLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { VideoGallery } from "@/components/VideoGallery";
import { VideoListCard } from "@/components/VideoListCard";
import Footer from "@/components/Footer";
import { NativeBanner } from "@/components/AdBanner";

import { useVideos } from "@/hooks/use-videos";
import { useInteractions } from "@/hooks/use-interactions";
import { useFirebase } from "@/context/FirebaseContext";
import { logoutUser } from "@/lib/auth-service";

import { DesktopHeader, MobileHeader, BottomNav } from "@/components/Navigation";

const VideoWatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { videos, supVideos, allVideos, loading: videosLoading } = useVideos();
  const { user } = useFirebase();
  const { toggleLike, toggleSave, isLiked, isSaved, toggleFavoriteChannel, isChannelFavorite } = useInteractions();
  
  const [activeMirror, setActiveMirror] = useState<number>(-1); // -1 is main
  const [showInfo, setShowInfo] = useState(false);
  const [overlayDismissed, setOverlayDismissed] = useState(false);

  useEffect(() => {
    setOverlayDismissed(false);
  }, [id]);

  const video = useMemo(() => allVideos.find((v) => v.id === id), [id, allVideos]);
  const isSup = useMemo(() => video ? isSupVideo(video) : false, [video]);
  
  const liked = useMemo(() => id ? isLiked(id) : false, [id, isLiked]);
  const saved = useMemo(() => id ? isSaved(id) : false, [id, isSaved]);

  const currentSrc = useMemo(() => {
    if (!video) return "";
    if (activeMirror === -1) return video.src;
    return video.mirrors?.[activeMirror] || video.src;
  }, [video, activeMirror]);

  const { modelVideos, recommendedVideos } = useMemo(() => {
    if (!video) return { modelVideos: [], recommendedVideos: [] };
    
    const currentModels = getVideoModels(video);
    const currentCats = video.channel || [];

    const candidateVideos = isSup ? (supVideos || []) : (videos || []);

    const allRelated = candidateVideos
      .filter((v) => v.id !== video.id)
      .map(v => {
        let score = 0;
        const vModels = getVideoModels(v);
        const sharedModels = vModels.filter(m => currentModels.includes(m));
        if (sharedModels.length > 0) score += 100 * sharedModels.length;
        const sharedCats = (v.channel || []).filter(c => currentCats.includes(c));
        score += sharedCats.length * 10;
        
        // For Stripchat/OnlyFans, we want to strictly favor model matches
        if (isSup) {
          if (sharedModels.length > 0) {
            score += 1000; // Boost model matches significantly
          } else {
            score = score * 0.01; // Heavily penalize non-model matches for Sup content
          }
        }
        
        return { ...v, score, isModelMatch: sharedModels.length > 0 };
      })
      .filter(v => v.score > 0)
      .sort((a, b) => b.score - a.score);

    const fromModelCount = isSup ? 20 : 8;
    const recommendedCount = isSup ? 24 : 16;

    const fromModel = allRelated.filter(v => v.isModelMatch).slice(0, fromModelCount);
    const recommended = allRelated.filter(v => !fromModel.find(mv => mv.id === v.id)).slice(0, recommendedCount);

    return { modelVideos: fromModel, recommendedVideos: recommended };
  }, [video, videos, supVideos, isSup]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id, video?.id]);

  if (videosLoading && !video) {
    return (
      <div className="min-h-screen bg-background">
        <DesktopHeader />
        <MobileHeader />
        <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
           <div className="space-y-8">
            <div className="relative rounded-[2.5rem] overflow-hidden bg-black aspect-video shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] ring-1 ring-white/10">
              <Skeleton className="w-full h-full rounded-none" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <div className="flex gap-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Video not found</h2>
          <Link to="/" className="text-primary hover:underline block">Return Home</Link>
        </div>
      </div>
    );
  }

  const embedUrl = getVideoEmbedUrl(video.src);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <DesktopHeader />
      <MobileHeader />
      
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none transition-all duration-1000 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center blur-[120px] scale-110 opacity-30"
          style={{ backgroundImage: `url(${getVideoThumbnailUrl(video.thumb)})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background to-background" />
      </div>

      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 hidden">
        <div className="flex items-center justify-between relative">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => {
                if (window.history.length > 2) {
                  navigate(-1);
                } else {
                  navigate(video.isSup ? "/sup" : "/");
                }
              }}
              className="flex items-center gap-2 text-[10px] font-black tracking-widest text-white/50 hover:text-white transition-all group cursor-pointer uppercase"
            >
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
              {video.isSup ? "STRIPCHAT" : "HOME"}
            </button>
            <nav className="hidden md:flex items-center gap-6 text-[10px] font-black tracking-widest text-white/40">
              <Link to="/models" className="hover:text-primary transition-colors uppercase">MODELS</Link>
              <Link to="/sup" className="hover:text-primary transition-colors uppercase">StripChat</Link>
            </nav>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none md:pointer-events-auto">
            <Link to="/" className="group flex flex-col items-center">
              <span className="text-xl md:text-2xl font-black tracking-tighter text-white group-hover:text-primary transition-colors leading-none uppercase">
                NAKED <span className="text-primary italic group-hover:text-white">GIRLS</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-4">
                <Link 
                  to="/library"
                  className="text-[10px] font-black tracking-widest text-white/60 hover:text-primary uppercase transition-colors"
                >
                  Library
                </Link>
                <button 
                  onClick={() => logoutUser()}
                  className="text-[10px] font-black tracking-widest text-primary hover:text-white uppercase transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link 
                to="/auth"
                state={{ from: window.location.pathname }}
                className="text-[10px] font-black tracking-widest text-primary hover:text-white uppercase transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-12">
          {/* Main Player Area */}
          <div className="space-y-8">
            <div 
              className="relative rounded-2xl md:rounded-[2.5rem] overflow-hidden bg-black shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] ring-1 ring-white/10 group"
              style={{ aspectRatio: video?.width && video?.height ? `${video.width}/${video.height}` : '16/9' }}
            >
              {video.overlay && !overlayDismissed && (
                <div 
                  className="absolute inset-0 z-10 cursor-pointer group/overlay"
                  onClick={() => setOverlayDismissed(true)}
                >
                  <img 
                    src={video.overlay} 
                    alt="Overlay"
                    className="w-full h-full object-cover transition-opacity duration-300 group-hover/overlay:opacity-90"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover/overlay:bg-black/10 transition-colors">
                    <div className="w-20 h-20 bg-primary/90 rounded-full flex items-center justify-center shadow-2xl scale-90 group-hover/overlay:scale-100 transition-transform">
                      <Play className="w-10 h-10 text-white fill-white ml-1" />
                    </div>
                  </div>
                </div>
              )}
              {(() => {
                const url = currentSrc;
                const isDirect = /\.(mp4|m4v|mov|webm|m3u8|mpd|ogg)(\?|$)/i.test(url);
                
                if (isDirect) {
                  return (
                    <video
                      key={url}
                      src={url}
                      poster={getVideoThumbnailUrl(video.thumb)}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                      playsInline
                    />
                  );
                } else {
                  return (
                    <iframe
                      key={url}
                      src={getVideoEmbedUrl(url)}
                      className="w-full h-full border-0"
                      allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                      allowFullScreen
                      {...({
                        webkitallowfullscreen: "true",
                        mozallowfullscreen: "true"
                      } as Record<string, string>)}
                    />
                  );
                }
              })()}
            </div>

            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 py-8 border-b border-white/10">
                  <div className="flex items-start md:items-center gap-6 flex-1">
                    <div className="space-y-1">
                      {isSup && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {(video.channel || []).filter(c => channels.some(chan => chan.name.toLowerCase() === c.toLowerCase())).map(cat => (
                            <span key={cat} className="px-3 py-1 rounded bg-primary text-[10px] font-black text-white uppercase tracking-[0.1em]">
                              {cat}
                            </span>
                          ))}
                        </div>
                      )}
                      <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase leading-[1.1]">
                        {video.title}
                      </h1>
                      <div className="flex items-center gap-2 text-[#00aaff] text-sm font-black uppercase tracking-widest">
                        {getVideoModels(video).map((m, idx, arr) => (
                           <Link 
                            key={m}
                            to={getModelUrl(m)} 
                            className="hover:underline"
                           >
                            {m}{idx < arr.length - 1 ? " & " : ""}
                           </Link>
                        ))}
                      </div>
                      <button 
                        onClick={() => setShowInfo(!showInfo)}
                        className={`flex items-center gap-1.5 text-white text-[11px] font-black uppercase tracking-tighter mt-3 hover:text-primary transition-colors ${showInfo ? "text-primary" : ""}`}
                      >
                        <span className="text-base leading-none">{showInfo ? "-" : "+"}</span> INFO
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                    <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                       <div className="flex flex-col gap-1">
                        <button 
                          onClick={() => {
                            if (id) {
                              toggleLike(id);
                            }
                          }}
                          className="flex items-center gap-2.5 text-white font-black text-sm uppercase tracking-widest hover:text-primary transition-colors group/fav"
                        >
                          <Heart className={`h-5 w-5 transition-all ${liked ? "fill-white text-primary scale-110" : "group-hover/fav:scale-110"}`} />
                          <span className={liked ? "text-primary" : ""}>{liked ? "LIKED" : "FAVORITE"}</span>
                        </button>
                        {liked && (
                          <Link to="/library" className="text-[9px] font-black tracking-widest text-primary/60 hover:text-primary transition-colors pl-7 uppercase">
                            View in Library
                          </Link>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <button 
                          onClick={() => {
                            if (id) {
                              toggleSave(id);
                            }
                          }}
                          className="flex items-center gap-2.5 text-white font-black text-sm uppercase tracking-widest hover:text-primary transition-colors group/save"
                        >
                          <Bookmark className={`h-5 w-5 transition-all ${saved ? "fill-white text-primary scale-110" : "group-hover/save:scale-110"}`} />
                          <span className={saved ? "text-primary" : ""}>{saved ? "SAVED" : "WATCH LATER"}</span>
                        </button>
                        {saved && (
                          <Link to="/library" className="text-[9px] font-black tracking-widest text-primary/60 hover:text-primary transition-colors pl-7 uppercase">
                            View in Library
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <AnimatePresence>
                  {showInfo && (video.description || video.directedBy) && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-b border-white/10"
                    >
                      <div className="py-8 space-y-6">
                        {video.directedBy && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black tracking-widest text-white/30 uppercase whitespace-nowrap">DIRECTED BY:</span>
                            <span className="text-sm font-black text-white tracking-tight">{video.directedBy}</span>
                          </div>
                        )}
                        {video.description && (
                          <p className="text-sm md:text-base font-black text-white leading-relaxed tracking-tight max-w-4xl">
                            {video.description}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-wrap items-center gap-6 md:gap-10 py-8 text-white border-b border-white/5">
                  <div className="flex items-center gap-3.5">
                    <Clock className="h-6 w-6 md:h-7 md:w-7 text-white/30" />
                    <span className="text-lg md:text-2xl font-black uppercase tracking-tight">
                      {formatDuration(video.duration)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3.5">
                    <Calendar className="h-6 w-6 md:h-7 md:w-7 text-white/30" />
                    <span className="text-lg md:text-2xl font-black uppercase tracking-tight">
                      {new Date(video.addedAt).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }).toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Mirror Selector */}
                {video.mirrors && video.mirrors.length > 0 && (
                  <div className="flex flex-wrap gap-2 py-4 border-b border-white/5">
                    <span className="text-[10px] font-black tracking-widest text-white/30 uppercase w-full mb-1">Select Source Mirror:</span>
                    <button
                      onClick={() => setActiveMirror(-1)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${
                        activeMirror === -1
                          ? "bg-primary text-white"
                          : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
                      }`}
                    >
                      Server 1
                    </button>
                    {video.mirrors.map((m, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveMirror(idx)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${
                          activeMirror === idx
                            ? "bg-primary text-white"
                            : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
                        }`}
                      >
                        Mirror {idx + 1}
                      </button>
                    ))}
                  </div>
                )}

                {/* Tags and Channels */}
                <div className="space-y-6 py-6">
                  {(video.channel || []).length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 px-1">Channels</h4>
                      <div className="flex flex-wrap gap-2">
                        {(video.channel || []).map(c => {
                          const isCatFav = isChannelFavorite(c);
                          return (
                            <div key={c} className="flex items-center gap-1">
                              <Link 
                                to={`/?filter=${encodeURIComponent(c)}`}
                                className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] hover:text-white hover:bg-primary/20 hover:border-primary/30 transition-all"
                              >
                                {c}
                              </Link>
                              <button
                                onClick={() => toggleFavoriteChannel(c)}
                                className={`p-1.5 rounded-xl transition-all ${
                                  isCatFav 
                                    ? "bg-primary text-white border border-primary" 
                                    : "bg-white/5 border border-white/10 text-white/20 hover:text-primary hover:border-primary/30"
                                }`}
                              >
                                <Bookmark size={10} className={isCatFav ? "fill-current" : ""} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {(video.tags || []).length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 px-1">Categories</h4>
                      <div className="flex flex-wrap gap-2">
                        {(video.tags || []).map(t => (
                          <Link 
                            key={t} 
                            to={`/?filter=${encodeURIComponent(t)}`}
                            className="px-4 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:bg-primary/20 transition-all"
                          >
                            {t}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Video Gallery */}
                {!isSup && video.gallery && video.gallery.length > 0 && (
                  <div className="py-12 border-t border-white/5">
                    <VideoGallery images={video.gallery} />
                  </div>
                )}
              </div>
          </div>

          {/* More from Model */}
          {modelVideos.length > 0 && (
            <section className="space-y-8">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  <h3 className="text-xs font-black tracking-[0.3em] text-white uppercase flex flex-wrap items-center gap-1.5">
                    More From 
                    <div className="flex items-center gap-1.5">
                      {getVideoModels(video).map((m, idx, arr) => (
                        <span key={m} className="flex items-center gap-1.5">
                          <Link 
                            to={getModelUrl(m)}
                            className="text-primary hover:text-white transition-colors"
                          >
                            {m}
                          </Link>
                          {idx < arr.length - 1 && <span className="opacity-30">/</span>}
                        </span>
                      ))}
                    </div>
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                  {getVideoModels(video).slice(0, 2).map(m => (
                    <Link 
                      key={m}
                      to={getModelUrl(m)} 
                      className="text-[10px] font-black text-white/40 hover:text-primary transition-colors tracking-widest uppercase hidden sm:block"
                    >
                      EXPLORE {m.split(' ')[0]}
                    </Link>
                  ))}
                </div>
              </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {modelVideos.map((v) => (
                  <VideoListCard key={v.id} video={v} />
                ))}
              </div>
            </section>
          )}

          <div className="max-w-4xl mx-auto">
            <NativeBanner />
          </div>

          {/* Recommended - BELOW */}
          <section className="space-y-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                 <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
                 <h3 className="text-xs font-black tracking-[0.3em] text-white uppercase">
                  Recommended For You
                </h3>
              </div>
              <Link to={isSupVideo(video) ? "/sup" : "/"} className="text-[10px] font-black text-white/30 hover:text-white transition-colors tracking-widest uppercase">
                {isSupVideo(video) ? "Back to StripChat Home" : "View Home"}
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {videosLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="w-full aspect-video rounded-xl sm:rounded-3xl" />
                    <div className="space-y-2 px-2">
                      <Skeleton className="h-4 w-full rounded-full" />
                      <Skeleton className="h-3 w-2/3 rounded-full" />
                    </div>
                  </div>
                ))
              ) : (
                recommendedVideos.map((v) => (
                  <VideoListCard key={v.id} video={v} />
                ))
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default VideoWatch;

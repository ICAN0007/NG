import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { useVideos } from '@/hooks/use-videos';
import { useFirebase } from '@/context/FirebaseContext';
import { logoutUser } from '@/lib/auth-service';
import { supModels, supVideos as initialSupVideos, SupModel, SupClip, supChannels } from '@/lib/sup-data';
import { VideoListCard } from '@/components/VideoListCard';
import { ClipCard } from '@/components/ClipCard';
import { 
  Folder, 
  ArrowLeft, 
  ChevronLeft,
  Lock, 
  Search, 
  Flame, 
  Video as VideoIcon, 
  Upload, 
  FileImage, 
  ChevronRight, 
  Star, 
  Eye,
  Maximize2,
  Smartphone,
  X,
  Users,
  Trash2,
  Bookmark
} from 'lucide-react';
import { sortOptions, getViews, formatDuration, videoHasModel } from '@/lib/videos';
import { getModelUrl } from '@/lib/model-utils';
import { useNavigate } from 'react-router-dom';
import Pagination from '@/components/Pagination';
import Footer from '@/components/Footer';
import { DesktopHeader, MobileHeader, BottomNav } from "@/components/Navigation";
import { TrendingCreators } from '@/components/TrendingCreators';

const ModelPortraitCard = ({ thumb, name, onNameClick, onImageClick }: { thumb: string; name: string; onNameClick?: () => void; onImageClick?: () => void }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    transition={{ type: "spring", stiffness: 400, damping: 17 }}
    className="group flex flex-col items-center gap-3"
  >
    <div 
      className="relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-[#1a1a1a] cursor-zoom-in"
      onClick={onImageClick}
    >
      {(thumb || "").match(/\.(mp4|webm|ogg|mov)$|^https:\/\/cdn\.freefile\.io/) ? (
        <video 
          src={thumb} 
          autoPlay 
          muted 
          loop 
          playsInline
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <img 
          src={thumb} 
          alt={name} 
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
      )}
      <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl" />
      
      {/* Zoom Icon Overlay */}
      <div className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 text-white/60 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
        <Maximize2 size={14} />
      </div>
    </div>
    <span 
      onClick={onNameClick}
      className="text-white font-black text-sm sm:text-base tracking-tight text-center group-hover:text-primary transition-colors cursor-pointer"
    >
      {name}
    </span>
  </motion.div>
);

const ModelBanner = ({ model }: { model: SupModel }) => {
  const [isFullImage, setIsFullImage] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleBannerClick = () => {
    if (model.banner?.type !== 'video') {
      setIsFullImage(true);
    }
  };

  const toggleFullScreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    } else {
      setIsFullImage(true);
    }
  };

  return (
    <>
      <div className="relative w-full overflow-hidden mb-12">
        {/* Banner Container */}
        <div 
          className={`relative w-full aspect-[21/9] md:aspect-[21/7] max-h-[500px] overflow-hidden group ${model.banner?.type !== 'video' ? 'cursor-pointer' : ''}`}
          onClick={handleBannerClick}
        >
          {model.banner?.type === 'video' ? (
            <video
              ref={videoRef}
              src={model.banner.url}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img 
              src={model.banner?.url || model.folderThumb} 
              alt={model.name} 
              className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-105"
            />
          )}
          
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/20" />
          
          {/* Full Screen Button */}
          <button 
            onClick={toggleFullScreen}
            className="absolute top-6 right-6 p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white/80 hover:text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 z-10"
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </div>

      {/* Full Size Image Modal */}
      <AnimatePresence>
        {isFullImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-12 cursor-zoom-out"
            onClick={() => setIsFullImage(false)}
          >
            <button 
              className="absolute top-10 right-10 z-[110] p-4 text-white/60 hover:text-white transition-colors"
              onClick={() => setIsFullImage(false)}
            >
              <X size={32} />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={model.banner?.url || model.folderThumb}
              alt={model.name}
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const ProfileHeader = ({ model }: { model: SupModel }) => {
  const [isFullImage, setIsFullImage] = useState(false);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Portrait Left */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-5 lg:col-span-4"
          >
            <div 
              className="aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl relative group cursor-pointer"
              onClick={() => setIsFullImage(true)}
            >
              <img 
                src={model.portrait || model.image} 
                alt={model.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
            </div>
          </motion.div>

        {/* Info Right */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-7 lg:col-span-8 flex flex-col justify-center h-full pt-4 md:pt-12"
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                 <h1 className="text-5xl md:text-6xl font-black text-white italic tracking-tighter lowercase">
                   {model.name}
                 </h1>
                 <button className="p-2 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-primary transition-all">
                   <Bookmark size={16} />
                 </button>
              </div>
              <div className="h-[1px] w-full bg-gradient-to-r from-primary/50 to-transparent" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-4">
              {[
                { label: 'Videos', value: model.videos?.length || 0 },
                { label: 'Photos', value: model.photos?.length || 0 },
                { label: 'Short Clips', value: model.clips?.length || 0 },
                { label: 'Portraits', value: model.portraitsCount || 0 },
                { label: 'Platform', value: model.platform }
              ].map((stat) => (
                <div key={stat.label} className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">
                    {stat.label}
                  </span>
                  <div className="text-xl font-black text-white italic tracking-tighter">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-white/60 text-base md:text-lg leading-relaxed max-w-2xl font-medium whitespace-pre-line">
              {model.bio || model.description || `${model.name} is one of our most exclusive members. Enjoy high-quality photoshoot collections and private video scenes updated weekly.`}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button className="px-8 py-4 bg-primary text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
                Subscribe to Access
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>

      {/* Full Size Portrait Modal */}
      <AnimatePresence>
        {isFullImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-12 cursor-zoom-out"
            onClick={() => setIsFullImage(false)}
          >
            <button 
              className="absolute top-10 right-10 z-[110] p-4 text-white/60 hover:text-white transition-colors"
              onClick={() => setIsFullImage(false)}
            >
              <X size={32} />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={model.portrait || model.image}
              alt={model.name}
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const ModelPhotos = ({ photos, title }: { photos: string[]; title?: string }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedPhoto !== null) {
      setSelectedPhoto((selectedPhoto - 1 + photos.length) % photos.length);
    }
  }, [selectedPhoto, photos.length]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedPhoto !== null) {
      setSelectedPhoto((selectedPhoto + 1) % photos.length);
    }
  }, [selectedPhoto, photos.length]);

  // Keyboard navigation
  useEffect(() => {
    if (selectedPhoto === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') setSelectedPhoto(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, handlePrev, handleNext]);

  return (
    <div className="space-y-8">
      {title && (
        <div className="mb-6">
          <h3 className="text-lg font-black tracking-tight text-white/90 italic">{title}</h3>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {photos.map((photo, idx) => (
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

      {/* Basic Photo Modal */}
      <AnimatePresence>
        {selectedPhoto !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 md:p-12 select-none"
          >
            <button className="absolute top-6 right-6 text-white/60 hover:text-white z-[160] transition-colors">
               <X size={32} />
            </button>

            {/* Navigation Buttons for Laptop/Desktop */}
            <div className="absolute inset-x-4 md:inset-x-8 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-[160]">
              <button 
                onClick={handlePrev}
                className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:scale-110 transition-all pointer-events-auto"
              >
                <ArrowLeft size={24} />
              </button>
              <button 
                onClick={handleNext}
                className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:scale-110 transition-all pointer-events-auto"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            <motion.div 
              key={selectedPhoto}
              initial={{ scale: 0.9, opacity: 0, x: 20 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              exit={{ scale: 0.9, opacity: 0, x: -20 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x > 100) handlePrev();
                else if (info.offset.x < -100) handleNext();
              }}
              className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
            >
              <img 
                src={photos[selectedPhoto]} 
                className="max-w-full max-h-full object-contain shadow-[0_0_80px_rgba(0,0,0,0.5)] rounded-lg pointer-events-none"
                alt="Enlarged view"
              />
              
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-black text-white/60 uppercase tracking-widest italic">
                {selectedPhoto + 1} / {photos.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ClipGrid = ({ 
  clips, 
  limit, 
  onClipClick,
  modelName
}: { 
  clips: (string | SupClip)[]; 
  limit?: number;
  onClipClick: (index: number) => void;
  modelName?: string;
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {(limit ? clips.slice(0, limit) : clips).map((clipItem, idx) => {
        const isObject = typeof clipItem !== 'string';
        const clip = isObject ? clipItem : {
          title: `${modelName || 'Model'} Clip ${idx + 1}`,
          url: clipItem,
          thumbnail: clipItem
        } as SupClip;

        return (
          <ClipCard 
            key={idx}
            clip={clip}
            onClick={() => onClipClick(idx)}
          />
        );
      })}
    </div>
  );
};

const ModelClips = ({ clips, onClipClick, title, modelName }: { clips: (string | SupClip)[]; onClipClick: (idx: number) => void, title?: string, modelName?: string }) => {
  const [showCount, setShowCount] = useState(12);

  return (
    <div className="space-y-8">
      {title && (
        <div className="mb-6">
          <h3 className="text-lg font-black tracking-tight text-white/90 italic">{title}</h3>
        </div>
      )}
      <ClipGrid clips={clips} limit={showCount} onClipClick={onClipClick} modelName={modelName} />

      {showCount < clips.length && (
        <div className="flex justify-center pt-8">
          <button 
            onClick={() => setShowCount(prev => prev + 12)}
            className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
          >
            Show More Clips
          </button>
        </div>
      )}
    </div>
  );
};

const Sup = () => {
  const { supVideos, loading } = useVideos();
  const { user } = useFirebase();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'videos' | 'uploaded' | 'photos' | 'clips'>('videos');
  const [currentPage, setCurrentPage] = useState(1);
  const VIDEOS_PER_PAGE = 24;
  const [modelCategory, setModelCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Latest");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedClipIndex, setSelectedClipIndex] = useState<number | null>(null);
  const [fullPortrait, setFullPortrait] = useState<string | null>(null);
  const [galleryClip, setGalleryClip] = useState<SupClip | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [activeClips, setActiveClips] = useState<(string | SupClip)[]>([]);
  const currentModelData = useMemo(() => supModels.find(m => m.name === selectedModel), [selectedModel]);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleNextClip = useCallback(() => {
    setGalleryIndex(0);
    if (selectedClipIndex !== null) {
      setSelectedClipIndex((selectedClipIndex + 1) % activeClips.length);
    }
  }, [selectedClipIndex, activeClips.length]);

  const handlePrevClip = useCallback(() => {
    setGalleryIndex(0);
    if (selectedClipIndex !== null) {
      setSelectedClipIndex((selectedClipIndex - 1 + activeClips.length) % activeClips.length);
    }
  }, [selectedClipIndex, activeClips.length]);

  const handleNextGallery = (urlsCount: number) => {
    setGalleryIndex((prev) => (prev + 1) % urlsCount);
  };

  const handlePrevGallery = (urlsCount: number) => {
    setGalleryIndex((prev) => (prev - 1 + urlsCount) % urlsCount);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedClipIndex === null) return;
      if (e.key === 'Escape') setSelectedClipIndex(null);
      if (e.key === 'ArrowRight') handleNextClip();
      if (e.key === 'ArrowLeft') handlePrevClip();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedClipIndex, activeClips, handleNextClip, handlePrevClip]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const allClips = useMemo(() => supModels
    .filter(m => {
      if (modelCategory === 'All') return true;
      return m.platform === modelCategory;
    })
    .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .flatMap(m => m.clips || []), [modelCategory, searchQuery]);

  const baseVideos = useMemo(() => [
    ...(supVideos || [])
  ], [supVideos]);

  const openClipPlayer = (clips: (string | SupClip)[], index: number) => {
    const clip = clips[index];
    if (typeof clip !== 'string' && clip.urls && clip.urls.length > 1) {
      setGalleryClip(clip);
    } else {
      setGalleryIndex(0);
      setActiveClips(clips);
      setSelectedClipIndex(index);
    }
  };

  const filteredVideos = useMemo(() => {
    return (selectedModel && currentModelData ? baseVideos.filter(v => videoHasModel(v, currentModelData.name)) : baseVideos)
      .filter(video => {
        if (!selectedModel && modelCategory !== 'All') {
            // Strict platform mapping: a video belongs to the platform of the models associated with it
            const modelsInThisCategory = supModels.filter(m => m.platform === modelCategory);
            return modelsInThisCategory.some(m => videoHasModel(video, m.name));
        }
        return true;
      })
      .filter(video => {
        const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             video.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesSearch;
      })
      .sort((a, b) => {
        const getV = (id: string) => {
          try {
            const v = getViews(id);
            if (!v) return 0;
            return parseInt(v.replace(/[kK]/g, '')) * (v.toLowerCase().includes('k') ? 1000 : 1);
          } catch {
            return 0;
          }
        };

        if (sortBy === 'Top Rated') {
          const viewsA = getV(a.id);
          const viewsB = getV(b.id);
          return viewsB - viewsA || b.id.localeCompare(a.id);
        }
        if (sortBy === 'Most Viewed') {
          const viewsA = getV(a.id);
          const viewsB = getV(b.id);
          return viewsB - viewsA;
        }
        if (sortBy === "Longest") {
          const getSecs = (d: string | undefined) => {
            if (!d) return 0;
            const parts = d.split(':').map(Number);
            return parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts[0] * 60 + (parts[1] || 0);
          };
          return getSecs(b?.duration) - getSecs(a?.duration);
        }
        if (sortBy === "Most Commented") {
          return ((b?.title?.length || 0) % 50) - ((a?.title?.length || 0) % 50) || b.id.localeCompare(a.id);
        }
        if (sortBy === "Most Favorited") {
          return ((b.id.length * (b.title?.length || 0)) % 100) - ((a.id.length * (a.title?.length || 0)) % 100) || b.id.localeCompare(a.id);
        }
        if (sortBy === "Random Videos") {
          const hash = (s: string | undefined) => (s || '').split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
          return hash(a.id + "sup-seed") - hash(b.id + "sup-seed");
        }

        // Default sort: By ID ascending (v1, v2, v3...) to start at v1
        const numA = parseInt(a.id.replace('v', ''));
        const numB = parseInt(b.id.replace('v', ''));
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return a.id.localeCompare(b.id);
      });
  }, [baseVideos, selectedModel, currentModelData, modelCategory, searchQuery, sortBy]);

  const totalPages = useMemo(() => Math.ceil(filteredVideos.length / VIDEOS_PER_PAGE), [filteredVideos.length]);
  const paginatedVideos = useMemo(() => filteredVideos.slice((currentPage - 1) * VIDEOS_PER_PAGE, currentPage * VIDEOS_PER_PAGE), [filteredVideos, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, modelCategory, selectedModel]);

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-24 md:pb-0 font-sans">
      <DesktopHeader />
      <MobileHeader />
      
      {/* Loading state removed per user request */}

      <div>
        {!selectedModel && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            {/* Page Header */}
            <div className="pt-4 pb-8 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="px-2 py-1 bg-primary/20 border border-primary/30 rounded text-[10px] font-black tracking-widest text-primary uppercase">
                  StripChat Members
                </div>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white italic lowercase">
                  Exclusive Content
                </h1>
              </div>

              {/* Model Category Tabs */}
              <div className="flex items-center gap-4 border-b border-white/5 pt-2 pb-6 overflow-x-auto no-scrollbar">
                {supChannels.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setModelCategory(cat)}
                    className={`relative px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      modelCategory === cat ? "text-primary" : "text-white/40 hover:text-white/60"
                    }`}
                  >
                    {cat}
                    {modelCategory === cat && (
                      <motion.div 
                        layoutId="activeModelCat"
                        className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-primary"
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-center justify-between w-full">
                {/* Search Input */}
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  <input 
                    type="text"
                    placeholder="Search models, videos, tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-white/20"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Unified Navigation & Filter Bar */}
            <div className="mb-10 flex flex-wrap items-center justify-between gap-6 border-b border-white/5 pb-1">
              <div className="flex items-center gap-8">
                {[
                  { id: 'videos', label: 'Videos', icon: VideoIcon },
                  { id: 'uploaded', label: 'Uploaded', icon: Upload },
                  { id: 'photos', label: 'Photos', icon: FileImage },
                  { id: 'clips', label: 'Short Clips', icon: Smartphone }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'videos' | 'uploaded' | 'photos' | 'clips')}
                    className={`flex items-center gap-2 pb-3 text-sm font-bold tracking-tight transition-all relative ${
                      activeTab === tab.id ? 'text-white' : 'text-white/30 hover:text-white/50'
                    } ${tab.id === 'photos' ? '!text-primary' : ''}`}
                  >
                    <tab.icon size={18} className={activeTab === tab.id ? "text-white" : tab.id === 'photos' ? "text-primary" : ""} />
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div 
                        layoutId="activeTabUnderline"
                        className={`absolute bottom-0 left-0 right-0 h-[2px] ${tab.id === 'photos' ? 'bg-primary' : 'bg-white'}`}
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-6 ml-auto">
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
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-12 items-start mt-8">
          <div className="flex-1 min-w-0 w-full">
            <AnimatePresence mode="wait">
            {!selectedModel ? (
              <motion.div 
                key="folders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-16"
              >
                <div className="pt-4">
                  {/* ... contents ... */}
                {(() => {
                  const tab = activeTab || 'videos';
                  if (tab === 'videos') {
                    return (
                      <div className="space-y-16">
                        {/* All Videos Preview */}
                        <section className="space-y-8">
                          <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <h3 className="text-[10px] font-black tracking-[0.4em] text-white/40 uppercase">Recommended Videos</h3>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                            {paginatedVideos.length > 0 ? (
                              paginatedVideos.map(video => (
                                <VideoListCard key={video.id} video={video} />
                              ))
                            ) : (
                              <div className="col-span-full py-12 text-center text-white/20 font-black uppercase tracking-widest">
                                No matching videos found
                              </div>
                            )}
                          </div>
                          
                          {totalPages > 1 && (
                            <div className="pt-8">
                              <Pagination 
                                currentPage={currentPage} 
                                totalPages={totalPages} 
                                onPageChange={(page) => {
                                  setCurrentPage(page);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }} 
                              />
                            </div>
                          )}
                        </section>

                        {/* Collections View */}
                        <section className="space-y-12">
                          <div className={modelCategory === "All" && searchQuery === "" ? "space-y-16" : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 sm:gap-x-8 gap-y-8 sm:gap-y-12"}>
                            {modelCategory === "All" && searchQuery === "" ? (
                              ["OnlyFans", "StripChat", "Indian", "Popular", "Uploaded"].map(cat => {
                                const modelsInCat = supModels.filter(m => m.platform === cat);
                                if (modelsInCat.length === 0) return null;
                                return (
                                  <div key={cat} className="space-y-6 sm:space-y-10">
                                    <div className="flex items-center gap-4">
                                      <h3 className="text-xl sm:text-3xl font-black text-white italic tracking-tighter">
                                        Models Search: {cat} <span className="text-[#FF2D88] ml-2">{modelsInCat.length}</span>
                                      </h3>
                                      <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 sm:gap-x-8 gap-y-8 sm:gap-y-12">
                                      {modelsInCat.map((model, idx) => (
                                       <ModelPortraitCard
                                          key={model.name}
                                          thumb={model.folderThumb}
                                          name={model.name}
                                          onNameClick={() => navigate(getModelUrl(model.name))}
                                          onImageClick={() => setFullPortrait(model.folderThumb)}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              (() => {
                                const list = supModels
                                  .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                  .filter(m => {
                                    if (modelCategory !== 'All') return m.platform === modelCategory;
                                    return true;
                                  });
                                
                                if (list.length === 0) {
                                  return (
                                    <div className="col-span-full py-12 text-center text-white/20 font-black uppercase tracking-widest">
                                      No matching collections found
                                    </div>
                                  );
                                }

                                return (
                                  <>
                                    <div className="col-span-full mb-4 sm:mb-8">
                                       <h3 className="text-xl sm:text-3xl font-black text-white italic tracking-tighter">
                                        Models Search: {searchQuery || modelCategory} <span className="text-[#FF2D88] ml-2">{list.length}</span>
                                      </h3>
                                    </div>
                                    {list.map((model, idx) => (
                                      <ModelPortraitCard
                                        key={model.name}
                                        thumb={model.folderThumb}
                                        name={model.name}
                                        onNameClick={() => navigate(getModelUrl(model.name))}
                                        onImageClick={() => setFullPortrait(model.folderThumb)}
                                      />
                                    ))}
                                  </>
                                );
                              })()
                            )}
                          </div>
                        </section>
                      </div>
                    );
                  }
                  if (tab === 'clips') {
                    return (
                      <div className="space-y-8">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                          <h3 className="text-[10px] font-black tracking-[0.4em] text-white/40 uppercase">All Short Clips</h3>
                        </div>
                        <ModelClips 
                          clips={allClips} 
                          onClipClick={(idx) => openClipPlayer(allClips, idx)} 
                          title="Featured Vertical Clips"
                        />
                      </div>
                    );
                  }
                  if (tab === 'photos') {
                    const allPhotos = Array.from(new Set(
                      supModels
                        .filter(m => {
                          if (modelCategory === 'All') return true;
                          return m.platform === modelCategory;
                        })
                        .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .flatMap(m => m.photos || [])
                    ));
                    return (
                      <div className="space-y-8">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                          <h3 className="text-[10px] font-black tracking-[0.4em] text-white/40 uppercase">Global Photo Gallery</h3>
                        </div>
                        <ModelPhotos photos={allPhotos} />
                      </div>
                    );
                  }
                  return (
                    <div className="py-20 text-center">
                      <p className="text-white/20 font-black uppercase tracking-widest">No {tab} available yet</p>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="videos"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-12"
            >
              {currentModelData && (
                <>
                  <div className="relative group">
                    <ModelBanner model={currentModelData} />
                    <button 
                      onClick={() => setSelectedModel(null)}
                      className="absolute top-8 left-8 z-30 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-all text-[10px] font-black uppercase tracking-widest text-white shadow-2xl"
                    >
                      <ArrowLeft size={14} /> Back to Members
                    </button>
                  </div>
                  <ProfileHeader model={currentModelData} />
                </>
              )}
              
              <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
                {/* Internal Tabs for selected model */}
                <div className="mb-10 flex items-center gap-8 border-b border-white/5 pb-1">
                  {[
                    { id: 'videos', label: 'Videos', icon: VideoIcon },
                    { id: 'photos', label: 'Photos', icon: FileImage },
                    { id: 'clips', label: 'Short Clips', icon: Smartphone }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as 'videos' | 'uploaded' | 'photos' | 'clips')}
                      className={`flex items-center gap-2 pb-3 text-sm font-bold tracking-tight transition-all relative ${
                        activeTab === tab.id ? 'text-white' : 'text-white/30 hover:text-white/50'
                      } ${tab.id === 'photos' ? '!text-primary' : ''}`}
                    >
                      <tab.icon size={18} className={activeTab === tab.id ? "text-white" : tab.id === 'photos' ? "text-primary" : ""} />
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div 
                          layoutId="selectedModelTabUnderline"
                          className={`absolute bottom-0 left-0 right-0 h-[2px] ${tab.id === 'photos' ? 'bg-primary' : 'bg-white'}`}
                        />
                      )}
                    </button>
                  ))}
                </div>

                <div className="pt-4">
                  {(() => {
                    const tab = activeTab || 'videos';
                    if (tab === 'videos') {
                      return (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                            {paginatedVideos.length > 0 ? (
                              paginatedVideos.map((video) => (
                                <VideoListCard key={video.id} video={video} />
                              ))
                            ) : (
                              <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                                <p className="text-white/20 font-black uppercase tracking-widest">No full videos available yet</p>
                                <p className="text-[10px] text-white/10 uppercase tracking-[0.2em] mt-2">Check the Photos or Clips tabs for exclusive content</p>
                              </div>
                            )}
                          </div>
                          {totalPages > 1 && (
                            <Pagination 
                              currentPage={currentPage} 
                              totalPages={totalPages} 
                              onPageChange={(page) => {
                                setCurrentPage(page);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }} 
                            />
                          )}
                        </>
                      );
                    }
                    if (tab === 'photos') {
                      const basePhotos = currentModelData?.photos || [];
                      const clipPhotos = currentModelData?.clips?.flatMap(c => {
                        if (typeof c === 'string') {
                          return c.toLowerCase().includes('.mp4') ? [] : [c];
                        }
                        return (c.urls || []).filter(u => !u.toLowerCase().includes('.mp4'));
                      }) || [];
                      const uniquePhotos = Array.from(new Set([...basePhotos, ...clipPhotos]));
                      return <ModelPhotos photos={uniquePhotos} />;
                    }
                    if (tab === 'clips') {
                      return (
                        <ModelClips 
                          clips={currentModelData?.clips || []} 
                          onClipClick={(idx) => openClipPlayer(currentModelData?.clips || [], idx)} 
                          title={currentModelData?.clipsTitle}
                          modelName={currentModelData?.name}
                        />
                      );
                    }
                    return (
                      <div className="py-20 text-center">
                        <p className="text-white/20 font-black uppercase tracking-widest">No {tab} available yet</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          )}
          {/* Mobile Trending Creators */}
          <div className="lg:hidden mt-12 px-4">
            <TrendingCreators />
          </div>
        </AnimatePresence>
      </div>

      {/* Right Sidebar */}
      <aside className="hidden lg:block w-[350px] shrink-0 sticky top-32 self-start pr-4 sm:pr-6 lg:pr-8">
        <TrendingCreators />
        <div className="mt-8 p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-primary/10 to-transparent">
          <h4 className="text-sm font-black uppercase tracking-widest mb-2 italic">Creator Perks</h4>
          <p className="text-[10px] text-white/40 leading-relaxed font-bold tracking-tight uppercase">
            Follow your favorite creators to get notified when they upload new exclusive content and go live.
          </p>
        </div>
      </aside>
    </div>

      {/* Global Clip Modal Player */}
      <AnimatePresence>
        {selectedClipIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 md:p-8"
            onClick={() => setSelectedClipIndex(null)}
          >
            <div className="absolute top-6 left-6 z-[160] flex items-center gap-4">
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedClipIndex(null); }}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10"
              >
                <ArrowLeft size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Back to Clips</span>
              </button>
            </div>

            <div className="absolute top-6 right-6 z-[110] flex items-center gap-4">
               <span className="text-[10px] font-black tracking-widest text-white/40 uppercase bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                 {selectedClipIndex + 1} / {activeClips.length}
               </span>
               <button 
                 onClick={(e) => { e.stopPropagation(); setSelectedClipIndex(null); }}
                 className="p-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
               >
                 <X size={20} />
               </button>
            </div>

            <button 
              onClick={(e) => { e.stopPropagation(); handlePrevClip(); }}
              className="absolute left-6 z-[110] p-4 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all hidden md:flex"
            >
              <ArrowLeft size={24} />
            </button>

            <button 
              onClick={(e) => { e.stopPropagation(); handleNextClip(); }}
              className="absolute right-6 z-[110] p-4 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all hidden md:flex"
            >
              <ChevronRight size={24} />
            </button>

            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const clip = activeClips[selectedClipIndex || 0];
                const isObj = typeof clip !== 'string';
                const urls = isObj && clip.urls ? clip.urls : [isObj ? clip.url : clip];
                const currentUrl = urls[galleryIndex % urls.length];
                const isVideo = currentUrl.toLowerCase().includes('.mp4');

                return (
                  <div className="relative w-full h-full">
                    {isVideo ? (
                      <video 
                        key={currentUrl}
                        ref={videoRef}
                        src={currentUrl}
                        autoPlay
                        controls
                        className="w-full h-full object-contain"
                        onEnded={() => {
                          if (urls.length > 1) {
                             handleNextGallery(urls.length);
                          } else {
                             handleNextClip();
                          }
                        }}
                      />
                    ) : (
                      <img src={currentUrl} alt="Gallery item" className="w-full h-full object-contain" />
                    )}

                    {urls.length > 1 && (
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 pointer-events-none">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handlePrevGallery(urls.length); }}
                          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 pointer-events-auto hover:bg-primary transition-colors"
                        >
                          <ArrowLeft size={18} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleNextGallery(urls.length); }}
                          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 pointer-events-auto hover:bg-primary transition-colors"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    )}

                    {urls.length > 1 && (
                      <div className="absolute top-4 inset-x-0 flex justify-center gap-1.5 px-4 overflow-x-auto no-scrollbar">
                        {urls.map((_, i) => (
                          <div 
                            key={i}
                            className={`h-1 rounded-full transition-all flex-shrink-0 ${i === galleryIndex ? 'w-4 bg-primary' : 'w-1.5 bg-white/30'}`}
                          />
                        ))}
                      </div>
                    )}
                    
                    {isObj && clip.title && (
                       <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10">
                          <p className="text-[10px] font-black italic text-primary uppercase tracking-tighter mb-1">
                            {urls.length > 1 ? `Collection: ${galleryIndex + 1}/${urls.length}` : 'Short Scene'}
                          </p>
                          <p className="text-xs font-bold text-white leading-tight line-clamp-2">{clip.title}</p>
                       </div>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vertical Gallery Overlay (Multi-image collection) */}
      <AnimatePresence>
        {galleryClip && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
            className="fixed inset-0 z-[120] bg-black overflow-y-auto"
          >
            {/* Header - Fixed to match screenshot vibe */}
            <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-2xl border-b border-white/5 px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <button 
                  onClick={() => setGalleryClip(null)}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="flex-1 min-w-0">
                  <h2 className="text-[11px] font-black text-white/90 italic uppercase tracking-tighter truncate leading-tight">
                    {galleryClip.title}
                  </h2>
                  <p className="text-[9px] font-black text-primary uppercase italic tracking-widest opacity-80">
                    Collection / {galleryClip.urls?.length || 0} items
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                 <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/5 text-[9px] font-black text-white/40 uppercase">
                    Scroll Down
                 </div>
              </div>
            </div>

            {/* Vertical Stack Content - Matching user requested layout */}
            <div className="w-full max-w-4xl mx-auto py-4 px-2 sm:px-4 space-y-4 sm:space-y-8">
              {galleryClip.urls?.map((url, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  className="relative w-full aspect-[9/16] sm:aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-zinc-950 flex items-center justify-center shadow-2xl border border-white/[0.03]"
                >
                  {/* Blurred Background Effect - THE CORE DESIGN ELEMENT */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center blur-[100px] scale-150 opacity-40 brightness-75 pointer-events-none"
                    style={{ backgroundImage: `url(${url})` }}
                  />
                  
                  {/* Main Centered Content */}
                  <div className="relative h-[95%] w-auto max-w-full z-10 flex items-center justify-center p-2">
                    {url.toLowerCase().includes('.mp4') ? (
                      <video 
                        src={url} 
                        className="h-full w-auto max-w-full object-contain rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                        controls
                        playsInline
                        loop
                      />
                    ) : (
                      <img 
                        src={url} 
                        alt={`Scene ${idx + 1}`} 
                        loading="lazy"
                        className="h-full w-auto max-w-full object-contain rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] hover:scale-[1.01] transition-transform duration-500"
                      />
                    )}
                  </div>
                  
                  {/* Subtle index indicator */}
                  <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[9px] font-black text-white/60">
                    {idx + 1} / {galleryClip.urls?.length}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* End Section */}
            <div className="py-20 flex flex-col items-center justify-center gap-6 text-center px-4">
              <div className="w-px h-12 bg-gradient-to-b from-primary/50 to-transparent" />
              <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">End of Collection</h4>
              <button 
                onClick={() => {
                  setGalleryClip(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group flex flex-col items-center gap-3"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <ArrowLeft size={24} className="rotate-90" />
                </div>
                <span className="text-[10px] font-black text-primary uppercase italic tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Back to Top
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      <Footer />
      <BottomNav />

      {/* Global Portrait Zoom */}
      <AnimatePresence>
        {fullPortrait && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 md:p-12 cursor-zoom-out"
            onClick={() => setFullPortrait(null)}
          >
            <div className="absolute top-8 right-8 z-[210] flex items-center gap-4">
              <button 
                onClick={() => setFullPortrait(null)}
                className="p-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full max-h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={fullPortrait} 
                alt="Full portrait" 
                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-[0_0_100px_rgba(255,45,136,0.15)] border border-white/10"
              />
              
              {/* Branding Label */}
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                <div className="px-3 py-1 bg-primary text-[10px] font-black uppercase tracking-[0.3em] text-white rounded-md shadow-lg shadow-primary/20">
                  StripChat Exclusive
                </div>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Single Collection View</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sup;

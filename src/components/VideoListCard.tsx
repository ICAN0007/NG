import React, { useState, useRef } from 'react';
import { Play, Clock, Eye, Heart, Bookmark } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Video, formatDuration, getVideoThumbnailUrl, getThumbnailAspectRatio, getVideoModels } from '@/lib/videos';
import { getModelUrl } from '@/lib/model-utils';
import { useInteractions } from '@/hooks/use-interactions';

interface VideoListCardProps {
  video: Video;
  className?: string;
}

export const VideoListCard: React.FC<VideoListCardProps> = ({ video, className = "" }) => {
  const navigate = useNavigate();
  const { isLiked, isSaved } = useInteractions();
  const [isHovered, setIsHovered] = useState(false);
  
  const liked = isLiked(video.id);
  const saved = isSaved(video.id);
  const [isTouch, setIsTouch] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    if (!isTouch) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Prevent immediate hover state if we want to distinguish from tap?
    // Actually, on many mobile sites, first touch previews, second touch navigates.
    // But let's just make it play as requested.
    setIsTouch(true);
    setIsHovered(true);
  };

  const handleTouchEnd = () => {
    // Optionally stop preview on touch end after a delay if not navigated
    setTimeout(() => {
      setIsHovered(false);
      setIsTouch(false);
    }, 3000);
  };

  const showPreview = isHovered && (video.previewUrl || video.src);

  return (
    <div
      onClick={() => navigate(`/video/${video.id}`)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`group space-y-4 w-full block cursor-pointer ${className}`}
    >
      <div className={`relative ${getThumbnailAspectRatio(video.thumb)} rounded-2xl overflow-hidden bg-[#1a1a1a] transition-all duration-300 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]`}>
        <img 
          src={getVideoThumbnailUrl(video.thumb)} 
          alt={video.title}
          loading="lazy"
          className={`w-full h-full object-cover transition-all duration-1000 ${
            showPreview ? 'opacity-0 scale-105' : 'group-hover:scale-105'
          }`}
          referrerPolicy="no-referrer"
          draggable={false}
        />
        
        {showPreview && (
          <video
            ref={videoRef}
            src={video.previewUrl || video.src}
            autoPlay
            muted
            loop
            playsInline
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover animate-in fade-in duration-500"
          />
        )}

        {/* Progress line for preview */}
        {showPreview && (
          <div className="absolute bottom-0 left-0 h-1 bg-primary w-full origin-left animate-[progress_3s_linear_infinite] z-30" />
        )}

        {/* Duration badge - Top Left */}
        <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-md flex items-center gap-1.5 z-20">
          <Clock className="h-3 w-3 text-white/80" />
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">
            {formatDuration(video.duration)}
          </span>
        </div>

        {/* Resolution badge - Bottom Right */}
        <div className="absolute bottom-2.5 right-2.5 bg-primary/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-black text-white uppercase tracking-tighter z-20 shadow-lg">
          4K ULTRA HD
        </div>

        {/* Status badges */}
        <div className="absolute top-2.5 right-2.5 flex gap-1 z-20">
          {liked && (
            <div className="bg-primary p-1.5 rounded-full shadow-lg border border-white/20">
              <Heart className="h-2.5 w-2.5 fill-white text-white" />
            </div>
          )}
          {saved && (
            <div className="bg-white p-1.5 rounded-full shadow-lg border border-black/10">
              <Bookmark className="h-2.5 w-2.5 fill-primary text-primary" />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1.5 px-0.5">
        <h4 className="text-base font-bold text-white group-hover:text-primary transition-colors line-clamp-1 leading-tight tracking-tight">
          {getVideoModels(video).length > 0 ? (
            getVideoModels(video).map((m, idx, arr) => (
              <React.Fragment key={m}>
                <Link 
                  to={getModelUrl(m)}
                  onClick={(e) => e.stopPropagation()}
                  className="hover:underline transition-all"
                >
                  {m}
                </Link>
                {idx < arr.length - 1 && <span className="mx-1 text-white/30 font-normal">&</span>}
              </React.Fragment>
            ))
          ) : (
            "Unknown Model"
          )}
        </h4>
      </div>
    </div>
  );
};




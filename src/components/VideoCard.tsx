import React, { useState, useRef } from 'react';
import { Play, User, Clock, Heart, Bookmark } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Video, formatDuration, getVideoThumbnailUrl, getThumbnailAspectRatio, getVideoModels, slugifyModel, getViews, formatDate as defaultFormatDate } from '@/lib/videos';
import { getModelUrl } from '@/lib/model-utils';
import { useInteractions } from '@/hooks/use-interactions';

interface VideoCardProps {
  video: Video;
  formatDate?: (dateStr: string) => string;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, formatDate = defaultFormatDate }) => {
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

  const handleTouchStart = () => {
    setIsTouch(true);
    setIsHovered(true);
  };

  const handleTouchEnd = () => {
    // Keep preview for a bit or immediately hide
    // setIsHovered(false);
  };

  const showPreview = isHovered && (video.previewUrl || video.src);

  const isLatest = React.useMemo(() => {
    try {
      const addedDate = new Date(video.addedAt).getTime();
      const now = new Date().getTime();
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      return now - addedDate < sevenDaysInMs;
    } catch {
      return false;
    }
  }, [video.addedAt]);

  return (
    <div
      onClick={() => navigate(`/video/${video.id}`)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="group rounded-3xl border bg-card text-left transition-all duration-300 hover:shadow-[0_32px_64px_-12px_rgba(220,50,60,0.15)] overflow-hidden border-border hover:border-primary/30 w-full cursor-pointer block"
    >
      <div className="relative overflow-hidden bg-secondary">
        <div className={getThumbnailAspectRatio(video.thumb)}>
          {video.thumb ? (
            <img
              src={getVideoThumbnailUrl(video.thumb)}
              alt={`${video.title} thumbnail`}
              loading="lazy"
              className={`h-full w-full object-cover transition-all duration-700 ${
                showPreview ? 'opacity-0' : 'opacity-100 group-hover:scale-110 group-hover:brightness-110'
              }`}
              referrerPolicy="no-referrer"
            />
          ) : (
            <video
              src={video.previewUrl || video.src}
              muted
              playsInline
              preload="metadata"
              className={`h-full w-full object-cover transition-all duration-700 ${
                showPreview ? 'opacity-0' : 'opacity-100'
              }`}
            />
          )}
        {showPreview && (
          <video
            ref={videoRef}
            src={video.previewUrl || video.src}
            poster={getVideoThumbnailUrl(video.thumb)}
            autoPlay
            muted
            loop
            playsInline
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover animate-in fade-in zoom-in-105 duration-500"
          />
        )}
        </div>

        {/* LATEST badge */}
        {isLatest && (
          <div className="absolute top-4 left-4 z-20">
            <div className="bg-primary text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-xl shadow-primary/30 tracking-widest uppercase animate-pulse">
              Latest
            </div>
          </div>
        )}

        {/* Duration badge */}
        <div className="absolute bottom-3 right-3 rounded-lg bg-background/90 px-2 py-0.5 text-[10px] font-bold text-foreground backdrop-blur-md shadow-2xl border border-white/5 z-10">
          {formatDuration(video.duration)}
        </div>

        {/* Play overlay */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none z-10 ${showPreview ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-white text-white transition-transform duration-500 group-hover:scale-110">
            <Play size={36} className="fill-white ml-1.5" />
          </div>
        </div>

        {/* Status badges */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
          {liked && (
            <div className="bg-primary p-2 rounded-full shadow-lg shadow-primary/20 animate-in zoom-in duration-300">
              <Heart className="h-3 w-3 fill-white text-white" />
            </div>
          )}
          {saved && (
            <div className="bg-white/90 p-2 rounded-full shadow-lg shadow-black/20 animate-in zoom-in duration-300">
              <Bookmark className="h-3 w-3 fill-primary text-primary" />
            </div>
          )}
        </div>
        
        <div className={`absolute bottom-4 left-6 right-6 z-10 transition-opacity duration-300 ${showPreview ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <h4 className="text-xl sm:text-3xl font-black leading-tight text-white transition-colors group-hover:text-primary tracking-tight line-clamp-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {video.title}
          </h4>
        </div>
      </div>

      <div className="p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <div className="text-sm font-black text-primary/90 z-10 flex items-center gap-2">
              <User className="h-3.5 w-3.5" />
              <div className="flex items-center gap-2">
                {getVideoModels(video).map((m, idx, arr) => (
                  <span key={m} className="flex items-center gap-1">
                    <Link 
                      to={getModelUrl(m)}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="hover:text-primary hover:underline transition-colors"
                    >
                      {m}
                    </Link>
                    {idx < arr.length - 1 && <span className="opacity-40">/</span>}
                  </span>
                ))}
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground flex items-center gap-3 mt-1.5 font-bold uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-primary" />
                {formatDate(video.addedAt)}
              </span>
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link 
            to="/?tag=NAKED GIRLS"
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="text-[10px] px-4 py-1.5 rounded-full bg-primary text-white font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all z-10"
          >
            NAKED GIRLS
          </Link>
          {video.channel.slice(0, 2).map((c) => (
            <Link 
              key={c} 
              to={`/?filter=${encodeURIComponent(c)}`}
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="text-[10px] px-4 py-1.5 rounded-full bg-secondary text-muted-foreground font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all z-10"
            >
              {c}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Video, getVideoThumbnailUrl } from "@/lib/videos";
import { isSupVideo } from "@/lib/sup-data";

interface TrendingVideosProps {
  videos: Video[];
}

const TrendingVideoItem = ({ video }: { video: Video }) => {
  const [isHovered, setIsHovered] = useState(false);
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
    setTimeout(() => {
      setIsHovered(false);
      setIsTouch(false);
    }, 3000);
  };

  const showPreview = isHovered && (video.previewUrl || video.src) && (video.previewUrl?.endsWith('.mp4') || video.src.endsWith('.mp4'));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Link
        to={`/video/${video.id}`}
        className="group block relative overflow-hidden rounded-xl bg-secondary/30 transition-all active:scale-[0.98] shadow-lg shadow-black/20"
      >
        <div className="aspect-video w-full overflow-hidden relative">
          <img
            src={getVideoThumbnailUrl(video.thumb)}
            alt={video.title}
            className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
              showPreview ? "opacity-0 scale-105" : "group-hover:scale-105"
            }`}
            loading="lazy"
            referrerPolicy="no-referrer"
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
        </div>
        {/* Subtle overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>
    </motion.div>
  );
};

export const TrendingVideos = ({ videos }: TrendingVideosProps) => {
  // MANUALLY ENTER IDs HERE to pin specific videos
  const manualIds: string[] = [
    "V2550", "V172", "V2150", "V499", "V500", 
    "V2532", "V155", "V2574", "V2562", "V10", 
    "V11", "V2533", "V13", "V14", "V2151"
  ]; 

  // Filter videos based ONLY on the manual IDs provided
  const displayVideos = manualIds
    .map(id => videos.find(v => v.id === id))
    .filter((v): v is Video => !!v && !isSupVideo(v));

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-sm font-black tracking-[0.2em] text-[#229ED9] mb-5 uppercase flex items-center gap-2 italic">
        <span className="h-5 w-1 rounded-full bg-[#229ED9]" />
        TRENDING VIDEOS
      </h3>
      <div className="space-y-4">
        {displayVideos.map((video) => (
          <TrendingVideoItem key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
};

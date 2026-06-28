import { videos } from "./videos";
import { allSupVideos } from "./sup-data";
import { Gallery } from "../types";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

// Include all videos (regular and SUP) that actually have a gallery array
export const galleries: Gallery[] = [...videos, ...allSupVideos]
  .filter((video) => video.gallery && video.gallery.length > 0)
  .map((video) => {
    return {
      id: video.id,
      slug: `${slugify(video.title)}-${video.id}`.toLowerCase(),
      modelName: video.model,
      title: video.title,
      description: video.description || `Experience the full gallery of ${video.model} in "${video.title}". Premium high-quality images from the latest scenes.`,
      coverImage: video.gallery![0],
      images: video.gallery!,
      studio: video.directedBy || "Vixen",
      addedAt: video.addedAt
    };
  });

export const getGalleryBySlug = (slug: string) => {
  return galleries.find((g) => g.slug === slug);
};

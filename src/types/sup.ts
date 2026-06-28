import { Video } from '../lib/videos';

export interface SupMember {
  id: string;
  name: string;
  image: string;
  platform: string;
  isNew?: boolean;
  description?: string;
  portraitsCount?: number;
}

export interface SupClip {
  title: string;
  url: string;
  thumbnail?: string;
  urls?: string[];
  duration?: string;
  views?: string;
  date?: string;
}

export interface SupModel extends SupMember {
  folderThumb: string;
  banner?: {
    type: 'image' | 'video';
    url: string;
  };
  portrait?: string;
  photos?: string[];
  clips?: (string | SupClip)[];
  clipsTitle?: string;
  videos: Video[];
  bio?: string;
  insidePhoto?: string;
}

export interface ModelData {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  stats: {
    posts: string;
    subscribers: string;
    likes: string;
  };
  portrait: string;
  photos: string[];
  clips: (SupClip | string)[];
  videos: string[];
}

import { createContext, useContext } from "react";
import { User } from "firebase/auth";
import { Video } from "@/lib/videos";

export interface FirebaseContextType {
  user: User | null;
  videos: Video[];
  supVideos: Video[];
  likedVideoIds: Set<string>;
  savedVideoIds: Set<string>;
  favoriteModelIds: Set<string>;
  favoriteCategories: Set<string>;
  loading: boolean;
}

export const FirebaseContext = createContext<FirebaseContextType>({ 
  user: null, 
  videos: [], 
  supVideos: [],
  likedVideoIds: new Set(),
  savedVideoIds: new Set(),
  favoriteModelIds: new Set(),
  favoriteCategories: new Set(),
  loading: true 
});

export const useFirebase = () => useContext(FirebaseContext);

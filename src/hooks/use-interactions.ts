import { doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useFirebase } from "@/context/FirebaseContext";
import { useNavigate } from "react-router-dom";

export const useInteractions = () => {
  const { user, likedVideoIds, savedVideoIds, favoriteModelIds, favoriteChannels } = useFirebase();
  const navigate = useNavigate();

  const toggleLike = async (videoId: string) => {
    if (!user) {
      navigate("/auth", { state: { from: window.location.pathname } });
      return;
    }

    const likeRef = doc(db, "users", user.uid, "likedVideos", videoId);
    
    try {
      if (likedVideoIds.has(videoId)) {
        await deleteDoc(likeRef);
      } else {
        await setDoc(likeRef, {
          userId: user.uid,
          videoId,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const toggleSave = async (videoId: string) => {
    if (!user) {
      navigate("/auth", { state: { from: window.location.pathname } });
      return;
    }

    const saveRef = doc(db, "users", user.uid, "savedVideos", videoId);
    
    try {
      if (savedVideoIds.has(videoId)) {
        await deleteDoc(saveRef);
      } else {
        await setDoc(saveRef, {
          userId: user.uid,
          videoId,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error toggling save:", error);
    }
  };

  const toggleFavoriteModel = async (modelId: string) => {
    if (!user) {
      navigate("/auth", { state: { from: window.location.pathname } });
      return;
    }

    const modelRef = doc(db, "users", user.uid, "favoriteModels", modelId);
    
    try {
      if (favoriteModelIds.has(modelId)) {
        await deleteDoc(modelRef);
      } else {
        await setDoc(modelRef, {
          userId: user.uid,
          modelId,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error toggling model favorite:", error);
    }
  };

  const toggleFavoriteChannel = async (category: string) => {
    if (!user) {
      navigate("/auth", { state: { from: window.location.pathname } });
      return;
    }

    // Use a URL-safe version of the category name as ID
    const categoryId = category.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const categoryRef = doc(db, "users", user.uid, "favoriteChannels", categoryId);
    
    try {
      if (favoriteChannels.has(categoryId)) {
        await deleteDoc(categoryRef);
      } else {
        await setDoc(categoryRef, {
          userId: user.uid,
          category,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error toggling category favorite:", error);
    }
  };

  return {
    toggleLike,
    toggleSave,
    toggleFavoriteModel,
    toggleFavoriteChannel,
    isLiked: (id: string) => likedVideoIds.has(id),
    isSaved: (id: string) => savedVideoIds.has(id),
    isModelFavorite: (id: string) => favoriteModelIds.has(id),
    isChannelFavorite: (category: string) => {
      const categoryId = category.toLowerCase().replace(/[^a-z0-9]/g, '-');
      return favoriteChannels.has(categoryId);
    }
  };
};

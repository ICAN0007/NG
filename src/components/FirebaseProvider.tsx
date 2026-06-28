import React, { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { videos as staticVideos, Video, isSupVideo } from "@/lib/videos";
import { allSupVideos } from "@/lib/sup-data";
import { FirebaseContext } from "@/context/FirebaseContext";
import { handleFirestoreError, OperationType } from "@/lib/firestore-utils";

const sortByDate = (vData: Video[]) => {
  return [...vData].sort((a, b) => {
    const dateA = a.addedAt || "";
    const dateB = b.addedAt || "";
    if (dateA !== dateB) return dateB.localeCompare(dateA);
    return (b.id || "").localeCompare(a.id || "");
  });
};

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [supVideos, setSupVideos] = useState<Video[]>([]);
  const [likedVideoIds, setLikedVideoIds] = useState<Set<string>>(new Set());
  const [savedVideoIds, setSavedVideoIds] = useState<Set<string>>(new Set());
  const [favoriteModelIds, setFavoriteModelIds] = useState<Set<string>>(new Set());
  const [favoriteCategories, setFavoriteCategories] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'videos'), orderBy('addedAt', 'desc'));
    const unsubscribeVideos = onSnapshot(q, (snapshot) => {
      const dbVideos = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Video[];

      const dbVideoIds = new Set(dbVideos.map(v => v.id));
      const remainingStatic = staticVideos.filter(v => !dbVideoIds.has(v.id));
      
      const rawAllVideos = [...dbVideos, ...remainingStatic];
      
      // Filter out Stripchat/Sup videos from the main "videos" list
      const mainVideosFiltered = rawAllVideos.filter(v => !isSupVideo(v));
      const supVideosFromRaw = rawAllVideos.filter(v => isSupVideo(v));
      const combinedSup = [...allSupVideos, ...supVideosFromRaw];
      const supVideosFiltered = Array.from(new Map(combinedSup.map(v => [v.id, v])).values());

      const sortedAll = sortByDate(mainVideosFiltered);
      const sortedSup = sortByDate(supVideosFiltered);
      setVideos(sortedAll);
      setSupVideos(sortedSup);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'videos');
      
      const mainVideosFiltered = staticVideos.filter(v => !isSupVideo(v));
      const supVideosFromStatic = staticVideos.filter(v => isSupVideo(v));
      const combinedSup = [...allSupVideos, ...supVideosFromStatic];
      const supVideosFiltered = Array.from(new Map(combinedSup.map(v => [v.id, v])).values());

      const sortedAll = sortByDate(mainVideosFiltered);
      const sortedSup = sortByDate(supVideosFiltered);

      setVideos(sortedAll);
      setSupVideos(sortedSup);
      setLoading(false);
    });

    return () => unsubscribeVideos();
  }, []);

  useEffect(() => {
    if (!user) {
      setLikedVideoIds(new Set());
      setSavedVideoIds(new Set());
      setFavoriteModelIds(new Set());
      setFavoriteCategories(new Set());
      return;
    }

    const likesUnsub = onSnapshot(
      collection(db, "users", user.uid, "likedVideos"),
      (snapshot) => {
        setLikedVideoIds(new Set(snapshot.docs.map((doc) => doc.id)));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/likedVideos`);
      }
    );

    const savesUnsub = onSnapshot(
      collection(db, "users", user.uid, "savedVideos"),
      (snapshot) => {
        setSavedVideoIds(new Set(snapshot.docs.map((doc) => doc.id)));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/savedVideos`);
      }
    );

    const modelsUnsub = onSnapshot(
      collection(db, "users", user.uid, "favoriteModels"),
      (snapshot) => {
        setFavoriteModelIds(new Set(snapshot.docs.map((doc) => doc.id)));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/favoriteModels`);
      }
    );

    const categoriesUnsub = onSnapshot(
      collection(db, "users", user.uid, "favoriteCategories"),
      (snapshot) => {
        setFavoriteCategories(new Set(snapshot.docs.map((doc) => doc.id)));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/favoriteCategories`);
      }
    );

    return () => {
      likesUnsub();
      savesUnsub();
      modelsUnsub();
      categoriesUnsub();
    };
  }, [user]);

  return (
    <FirebaseContext.Provider value={{ 
      user, 
      videos, 
      supVideos, 
      likedVideoIds, 
      savedVideoIds, 
      favoriteModelIds,
      favoriteCategories,
      loading 
    }}>
      {children}
    </FirebaseContext.Provider>
  );
};

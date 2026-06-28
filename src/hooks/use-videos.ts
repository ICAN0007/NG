import { useMemo } from 'react';
import { useFirebase } from '@/context/FirebaseContext';

export function useVideos() {
  const { videos, supVideos, loading } = useFirebase();
  const allVideos = useMemo(() => [...videos, ...supVideos], [videos, supVideos]);
  return { videos, supVideos, allVideos, loading };
}

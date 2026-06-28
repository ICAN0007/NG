import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // If we're changing the path (navigation)
    // but NOT if we're just changing search params (like video selection)
    // unless the user wants to scroll to top on every search change.
    // Actually, video selection uses search params (?v=...).
    // We already have a specific scroll-to-player for that in Index.tsx.
    
    // For navigation between main pages, we always scroll to top.
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return null;
};

export default ScrollToTop;

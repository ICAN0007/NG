import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import VideoWatch from "./pages/VideoWatch";
import Models from "./pages/Models";
import ModelProfile from "./pages/ModelProfile";
import Galleries from "./pages/Galleries";
import GalleryDetail from "./pages/GalleryDetail";
import SearchResult from "./pages/Search";
import Sup from "./pages/Sup";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Library from "./pages/Library";
import DMCA from "./pages/DMCA";
import Compliance from "./pages/Compliance";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import AgeVerification from "./components/AgeVerification";
import ErrorBoundary from "./components/ErrorBoundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FirebaseProvider } from "./components/FirebaseProvider";
import { Toaster } from "@/components/ui/sonner";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <FirebaseProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AgeVerification />
          <Toaster position="top-center" richColors />
          <ErrorBoundary>
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/video/:id" element={<VideoWatch />} />
            <Route path="/models" element={<Models />} />
            <Route path="/models/:slug" element={<ModelProfile />} />
            <Route path="/SUP/:slug" element={<ModelProfile />} />
            <Route path="/galleries" element={<Galleries />} />
            <Route path="/gallery/:slug" element={<GalleryDetail />} />
            <Route path="/search" element={<SearchResult />} />
            <Route path="/sup" element={<Sup />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/library" element={<Library />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/dmca" element={<DMCA />} />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
      </FirebaseProvider>
    </QueryClientProvider>
  );
};

export default App;

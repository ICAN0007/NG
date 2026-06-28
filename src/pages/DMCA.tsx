import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ChevronLeft, FileText } from "lucide-react";
import Footer from "@/components/Footer";
import PixelAtmosphere from "@/components/PixelAtmosphere";
import MarkdownContent from "@/components/MarkdownContent";
import { DMCA_POLICY } from "@/data/legal";

import { DesktopHeader, MobileHeader, BottomNav } from "@/components/Navigation";

const DMCA = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white pb-24 md:pb-0 font-sans">
      <div className="pointer-events-none fixed inset-0 z-0">
        <PixelAtmosphere density={30} />
      </div>

      <DesktopHeader />
      <MobileHeader />

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="text-center space-y-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2">
              <FileText className="h-8 w-8" />
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter italic" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              DMCA <span className="not-italic">Policy</span>
            </h1>
            <p className="text-lg text-white/40 font-medium max-w-xl mx-auto">
              NakedGirls respects intellectual property rights and intellectual freedom.
            </p>
          </div>

          <div className="mt-12 bg-white/5 border border-white/10 p-8 sm:p-12 rounded-[2rem] backdrop-blur-sm">
             <MarkdownContent content={DMCA_POLICY} />
          </div>
        </motion.div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default DMCA;

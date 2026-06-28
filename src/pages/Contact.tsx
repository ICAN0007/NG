import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ChevronLeft, MessageSquare, Mail, Instagram, Send } from "lucide-react";
import Footer from "@/components/Footer";
import PixelAtmosphere from "@/components/PixelAtmosphere";
import { SOCIAL_LINKS } from "@/data/legal";

import { DesktopHeader, MobileHeader, BottomNav } from "@/components/Navigation";

const Contact = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-primary selection:text-white pb-24 md:pb-0 font-sans">
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
              <MessageSquare className="h-8 w-8" />
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter italic" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Contact <span className="not-italic">Us</span>
            </h1>
            <p className="text-lg text-white/40 font-medium max-w-xl mx-auto">
              Our support team is available 24/7 to assist you with any inquiries or compliance matters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {/* Email Support */}
            <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-sm space-y-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-black tracking-tight">Email Support</h3>
              <p className="text-sm text-white/40 leading-relaxed font-medium">
                For account issues, technical support, or billing inquiries.
              </p>
              <a href="mailto:ecsupports@proton.me" className="block text-primary font-bold hover:underline">
                ecsupports@proton.me
              </a>
            </div>

            {/* Social Support */}
            <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-sm space-y-6">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Send className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-black tracking-tight">Direct Updates</h3>
              <div className="space-y-3">
                <a 
                  href={SOCIAL_LINKS.telegram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/5 hover:border-primary/30 transition-all group"
                >
                  <Send className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Telegram Main Channel</span>
                </a>
                <a 
                  href={SOCIAL_LINKS.telegram_alt} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/5 hover:border-primary/30 transition-all group"
                >
                  <Send className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Elite Pleasure Clips</span>
                </a>
                <a 
                  href={SOCIAL_LINKS.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/5 hover:border-primary/30 transition-all group"
                >
                  <Instagram className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Instagram Feed</span>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Contact;

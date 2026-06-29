import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#050505] text-[#9ca3af] py-20 px-6 border-t border-white/5 mt-20 relative z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-12 lg:gap-8">
        
        {/* Logo & Description */}
        <div className="lg:col-span-2 space-y-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-black rotate-0" />
            </div>
            <span className="text-xl font-black text-white italic tracking-tighter">
              NAKED <span className="text-primary not-italic">GIRLS</span>
            </span>
          </Link>
          <p className="text-sm leading-relaxed max-w-sm text-[#9ca3af]">
            Naked Girls is your destination for high-quality adult content and live cam sessions. We feature the most popular models and curated scenes for a premium viewing experience.
          </p>
          <Link 
            to="/contact" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all group border border-white/5"
          >
            <span className="font-bold text-sm">Contact Support</span>
            <ArrowUpRight className="w-4 h-4 text-white/40 group-hover:text-primary transition-colors" />
          </Link>
        </div>

        {/* PAGE */}
        <div className="space-y-6">
          <h4 className="text-xs font-black text-white uppercase tracking-[0.2em]">Page</h4>
          <ul className="space-y-4 text-sm">
            <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li><Link to="/models" className="hover:text-primary transition-colors">Models</Link></li>
            <li><Link to="/sup" className="hover:text-primary transition-colors">Stripchat</Link></li>
          </ul>
        </div>

        {/* RESOURCES */}
        <div className="space-y-6">
          <h4 className="text-xs font-black text-white uppercase tracking-[0.2em]">Resources</h4>
          <ul className="space-y-4 text-sm">
            <li><Link to="/auth?mode=login" className="hover:text-primary transition-colors">Sign In</Link></li>
            <li><Link to="/auth?mode=signup" className="hover:text-primary transition-colors">Sign Up</Link></li>
            <li><Link to="/library" className="hover:text-primary transition-colors">My Library</Link></li>
            <li><Link to="/contact" className="hover:text-primary transition-colors">Help Center</Link></li>
          </ul>
        </div>

        {/* EXPLORE */}
        <div className="space-y-6">
          <h4 className="text-xs font-black text-white uppercase tracking-[0.2em]">Explore</h4>
          <ul className="space-y-4 text-sm">
            <li><Link to="/sup" className="hover:text-primary transition-colors">Premium Content</Link></li>
            <li><Link to="/models" className="hover:text-primary transition-colors">Browse Models</Link></li>
            <li><a href="#" className="hover:text-primary transition-colors">Developer API</a></li>
          </ul>
        </div>

        {/* LEGAL */}
        <div className="space-y-6">
          <h4 className="text-xs font-black text-white uppercase tracking-[0.2em]">Legal</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            <li><Link to="/dmca" className="hover:text-primary transition-colors">DMCA Notice</Link></li>
            <li><Link to="/compliance" className="hover:text-primary transition-colors">2257 Compliance</Link></li>
          </ul>
        </div>

        {/* SOCIAL */}
        <div className="space-y-6">
          <h4 className="text-xs font-black text-white uppercase tracking-[0.2em]">Follow Us</h4>
          <ul className="space-y-4 text-sm">
            <li><a href="https://t.me/Vibevault_18" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors inline-flex items-center gap-2">Vibe Vault Telegram</a></li>
            <li><a href="https://t.me/ElitePleasureClips" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors inline-flex items-center gap-2">Elite Pleasure Telegram</a></li>
            <li><a href="#" className="hover:text-primary transition-colors inline-flex items-center gap-2">Twitter / X</a></li>
            <li><a href="#" className="hover:text-primary transition-colors inline-flex items-center gap-2">Discord</a></li>
          </ul>
        </div>

      </div>

      {/* Bottom Footer Row */}
      <div className="max-w-7xl mx-auto pt-12 mt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-[10px] font-bold tracking-widest uppercase text-white/30">
          ©2026 Naked Girls. All rights reserved.
        </p>
        <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-white/40">
          <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
          <Link to="/dmca" className="hover:text-primary transition-colors">DMCA</Link>
        </div>
      </div>
      
      {/* Extra spacing for mobile BottomNav */}
      <div className="h-20 md:hidden" />
    </footer>
  );
};

export default Footer;

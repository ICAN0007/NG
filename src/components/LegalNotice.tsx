import { LEGAL_DISCLAIMER, COMPLIANCE_LINKS, PARENTAL_CONTROL_LINKS, CONTACT_EMAIL } from "@/data/legal";

const LegalNotice = () => {
  return (
    <div className="space-y-8 text-sm leading-relaxed text-white/60">
      <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl">
        <h2 className="text-xl font-black text-primary mb-4 tracking-tight">WARNING!</h2>
        <div className="whitespace-pre-wrap font-medium">
          {LEGAL_DISCLAIMER}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4">
        {COMPLIANCE_LINKS.map(link => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center p-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-white/40 hover:bg-primary/20 hover:text-white hover:border-primary transition-all text-center"
          >
            {link.name}
          </a>
        ))}
      </div>

      <div className="bg-black/40 border border-white/5 p-8 rounded-2xl space-y-6">
        <div>
          <h3 className="text-white font-bold mb-2 uppercase tracking-widest text-xs">Contact Us</h3>
          <p className="text-lg font-bold text-primary">{CONTACT_EMAIL}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          <button 
            onClick={() => window.location.href = "https://www.google.com"}
            className="px-8 py-3 bg-red-600/20 text-red-500 border border-red-500/30 rounded-full text-[10px] font-black tracking-widest uppercase hover:bg-red-600 hover:text-white transition-all"
          >
            Exit Let Me Leave This Site
          </button>
        </div>

        <div className="pt-6 border-t border-white/5">
          <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-4 text-center">
            Parents please use one of these programs to protect your children from adult material.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {PARENTAL_CONTROL_LINKS.map(link => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white/40 hover:text-primary transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalNotice;

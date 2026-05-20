"use client";

import { useLang } from "@/lib/i18n";

export default function Hero() {
  const { t } = useLang();
  const h = t.hero;

  return (
    <section
      className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#080808]"
      aria-label="Player introduction"
    >
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-[radial-gradient(ellipse_at_80%_5%,rgba(225,29,72,0.09)_0%,transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: "radial-gradient(circle, #2a2a2a 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="absolute right-[14%] inset-y-0 w-px bg-gradient-to-b from-transparent via-[#e11d48]/15 to-transparent" />
        <div className="absolute right-[20%] inset-y-0 w-px bg-gradient-to-b from-transparent via-white/4 to-transparent" />
        <div className="absolute right-[-2%] bottom-[-4%] font-heading font-black text-white/[0.025] leading-none hidden lg:block" style={{ fontSize: "32rem" }}>9</div>
      </div>

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-28 pb-24 w-full">
        <div className="animate-fade-up flex flex-wrap items-center gap-4 mb-7">
          <div className="flex items-center gap-3">
            <div className="w-8 h-px bg-[#e11d48]" />
            <span className="text-zinc-500 text-xs font-semibold tracking-[0.25em] uppercase">{h.club}</span>
          </div>
          <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-zinc-300 text-xs font-semibold px-3 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            {h.availableBadge}
          </span>
        </div>

        <h1 className="animate-fade-up animation-delay-100 font-heading font-black uppercase leading-[0.9] tracking-tight text-white" style={{ fontSize: "clamp(3.5rem, 13vw, 10.5rem)" }}>
          Gerard<br />
          <span className="text-[#e11d48]">Gani</span>
        </h1>

        <div className="animate-fade-up animation-delay-200 flex flex-wrap items-center gap-2 sm:gap-3 mt-6 mb-5">
          <span className="bg-[#e11d48] text-white text-xs font-bold px-3 py-1.5 tracking-[0.15em] uppercase">{h.striker}</span>
          <span className="text-zinc-700 font-light">/</span>
          <span className="border border-zinc-700 text-zinc-300 text-xs font-bold px-3 py-1.5 tracking-[0.15em] uppercase">{h.winger}</span>
          <span className="text-zinc-700 text-sm">·</span>
          <span className="text-zinc-500 text-xs font-medium tracking-wide">{h.meta}</span>
        </div>

        <p className="animate-fade-up animation-delay-300 text-zinc-300 text-base sm:text-lg max-w-lg leading-relaxed font-medium">
          {h.pitch}
        </p>

        <div className="animate-fade-up animation-delay-400 flex flex-col sm:flex-row gap-3 mt-8">
          <a href="#contact" className="inline-flex items-center justify-center gap-2.5 bg-[#e11d48] hover:bg-[#be123c] text-white font-bold px-8 py-4 uppercase tracking-[0.15em] text-sm transition-colors duration-200">
            {h.cta1}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </a>
          <a href="#videos" className="inline-flex items-center justify-center gap-2.5 border border-zinc-700 hover:border-zinc-400 text-white font-bold px-8 py-4 uppercase tracking-[0.15em] text-sm transition-colors duration-200">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
            {h.cta2}
          </a>
        </div>

      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" aria-hidden="true">
        <span className="text-zinc-700 text-[10px] tracking-[0.25em] uppercase">{h.scroll}</span>
        <div className="w-px h-10 bg-gradient-to-b from-zinc-700 to-transparent" />
      </div>
    </section>
  );
}

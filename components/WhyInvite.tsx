"use client";

import { useLang } from "@/lib/i18n";

export default function WhyInvite() {
  const { t } = useLang();
  const w = t.why;

  return (
    <section id="why" className="bg-[#0d0d0d] py-20 sm:py-28 border-t border-[#161616]" aria-labelledby="why-heading">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-6 h-px bg-[#e11d48]" />
          <span className="text-zinc-500 text-xs font-semibold tracking-[0.25em] uppercase">{w.eyebrow}</span>
        </div>
        <h2 id="why-heading" className="font-heading font-black text-white uppercase leading-none mb-16" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>
          {w.heading}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1a1a1a]">
          {w.items.map(({ title, body }, i) => (
            <div key={i} className="bg-[#0d0d0d] p-8 sm:p-10 flex flex-col gap-5">
              <span className="font-heading font-black text-[#e11d48] text-5xl leading-none">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-heading font-bold text-white uppercase text-xl sm:text-2xl leading-tight">{title}</h3>
              <p className="text-zinc-500 text-sm sm:text-base leading-relaxed flex-1">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-8 border-t border-[#161616]">
          <p className="text-zinc-500 text-base sm:text-lg">
            {w.cta1}{" "}
            <span className="text-white font-medium">{w.cta2}</span>
          </p>
          <a href="#contact" className="shrink-0 bg-[#e11d48] hover:bg-[#be123c] text-white font-bold px-8 py-4 uppercase tracking-[0.15em] text-sm transition-colors duration-200">
            {w.ctaBtn}
          </a>
        </div>
      </div>
    </section>
  );
}

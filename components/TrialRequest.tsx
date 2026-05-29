"use client";

import { Fragment } from "react";
import { useLang } from "@/lib/i18n";

export default function TrialRequest() {
  const { t } = useLang();
  const tr = t.trial;

  return (
    <section id="trial" className="relative bg-[#e11d48] py-20 sm:py-32 overflow-hidden" aria-labelledby="trial-heading">
      <div className="absolute inset-0 opacity-[0.08]" aria-hidden="true" style={{ backgroundImage: "repeating-linear-gradient(-45deg, #000 0, #000 1px, transparent 0, transparent 50%)", backgroundSize: "10px 10px" }} />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 font-heading font-black text-black/[0.05] leading-none pointer-events-none select-none hidden lg:block" style={{ fontSize: "28rem" }} aria-hidden="true">1</div>

      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 text-center">
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="w-8 h-px bg-white/30" />
          <span className="text-white/50 text-xs font-semibold tracking-[0.3em] uppercase">{tr.eyebrow}</span>
          <div className="w-8 h-px bg-white/30" />
        </div>

        <blockquote>
          <p id="trial-heading" className="font-heading font-black text-white uppercase leading-[0.95] mb-6" style={{ fontSize: "clamp(2rem, 5.5vw, 4.5rem)" }}>
            {tr.quote.split("\n").map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </p>
          <footer className="text-white/65 text-lg sm:text-xl font-light mb-12 leading-relaxed">
            {tr.sub}
          </footer>
        </blockquote>

        <a href="#contact" className="inline-block bg-white text-[#e11d48] font-heading font-black text-sm uppercase tracking-[0.2em] px-10 py-5 hover:bg-zinc-100 active:bg-zinc-200 transition-colors duration-200">
          {tr.cta}
        </a>

        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-14 text-white/40 text-xs tracking-widest uppercase" aria-label="Key facts">
          {tr.facts.map((fact, i) => (
            <Fragment key={fact}>
              <li>{fact}</li>
              {i < tr.facts.length - 1 && <li aria-hidden="true">·</li>}
            </Fragment>
          ))}
        </ul>
      </div>
    </section>
  );
}

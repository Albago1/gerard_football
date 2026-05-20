"use client";

import { useLang } from "@/lib/i18n";

export default function About() {
  const { t } = useLang();
  const a = t.about;

  return (
    <section id="about" className="bg-[#080808] py-20 sm:py-28" aria-labelledby="about-heading">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-12 lg:gap-24 items-start">

          <div className="lg:pt-2">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-6 h-px bg-[#e11d48]" />
              <span className="text-zinc-500 text-xs font-semibold tracking-[0.25em] uppercase">{a.eyebrow}</span>
            </div>
            <h2 id="about-heading" className="font-heading font-black text-white uppercase leading-none" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>
              {a.heading1}<br />{a.heading2}
            </h2>
            <div className="mt-8 w-10 h-1 bg-[#e11d48]" />
          </div>

          <div className="space-y-6 text-zinc-400 text-base sm:text-[1.05rem] leading-relaxed">
            <p>{a.p1}</p>
            <p>{a.p2}</p>
            <p>{a.p3}</p>
            <p className="text-zinc-200 font-medium border-l-2 border-[#e11d48] pl-4">{a.quote}</p>
          </div>

        </div>
      </div>
    </section>
  );
}

"use client";

import { useLang } from "@/lib/i18n";

export default function FootageCTA() {
  const { t } = useLang();
  const v = t.videos;

  return (
    <section className="bg-[#080808] border-t border-[#111] py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-6 sm:p-8 border border-[#1e1e1e] bg-[#0d0d0d]">
          <div>
            <p className="text-white font-semibold text-base mb-1">{v.footerTitle}</p>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-md">{v.footerDesc}</p>
          </div>
          <a
            href="#contact"
            className="shrink-0 bg-[#e11d48] hover:bg-[#be123c] text-white text-xs font-bold px-6 py-3 uppercase tracking-[0.15em] transition-colors duration-200 text-center"
          >
            {v.footerBtn}
          </a>
        </div>
      </div>
    </section>
  );
}

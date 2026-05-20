"use client";

import { useLang } from "@/lib/i18n";

export default function PlayerSnapshot() {
  const { t } = useLang();
  const s = t.snapshot;

  const stats = [
    { label: s.labels.position,    value: "ST / LW" },
    { label: s.labels.age,         value: "18" },
    { label: s.labels.height,      value: "187 cm" },
    { label: s.labels.weight,      value: "78 kg" },
    { label: s.labels.nationality, value: s.values.nationality },
    { label: s.labels.club,        value: "SC Staaken U18" },
    { label: s.labels.strongFoot,  value: s.values.strongFoot, accent: "10 / 10" },
    { label: s.labels.weakFoot,    value: s.values.weakFoot,   accent: "8 / 10" },
  ];

  return (
    <section id="stats" className="bg-[#0d0d0d] py-16 sm:py-20 border-y border-[#161616]" aria-labelledby="snapshot-heading">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-6 h-px bg-[#e11d48]" />
          <span className="text-zinc-500 text-xs font-semibold tracking-[0.25em] uppercase">{s.eyebrow}</span>
        </div>
        <h2 id="snapshot-heading" className="font-heading font-black text-white uppercase text-4xl sm:text-5xl mb-10">
          {s.heading}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#1e1e1e]">
          {stats.map(({ label, value, accent }) => (
            <div key={label} className="bg-[#0d0d0d] hover:bg-[#121212] transition-colors duration-200 p-5 sm:p-7">
              <div className="text-zinc-600 text-[10px] font-semibold tracking-[0.2em] uppercase mb-2.5">{label}</div>
              <div className="font-heading font-bold text-white text-xl sm:text-2xl leading-tight">{value}</div>
              {accent && <div className="text-[#e11d48] text-xs font-bold mt-1.5 tracking-wide">{accent}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

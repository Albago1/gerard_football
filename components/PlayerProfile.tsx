"use client";

import { useLang } from "@/lib/i18n";

const CLUBS = [
  { name: "KF Tirana",         ageGroups: ["U13", "U15"], initials: "KFT", color: "#ef4444", logo: "/clubs/kf-tirana.png" },
  { name: "Blau Weiss Berlin", ageGroups: ["U15"],         initials: "BWB", color: "#3b82f6", logo: "/clubs/blau-weiss-berlin.png" },
  { name: "Berliner SC",       ageGroups: ["U17", "U18"], initials: "BSC", color: "#818cf8", logo: "/clubs/berliner-sc.png" },
  { name: "SC Staaken",        ageGroups: ["U18", "U19"], initials: "SCS", color: "#e11d48", logo: "/clubs/sc-staaken.png" },
];

function ClubLogo({ logo, initials, color, name }: { logo: string; initials: string; color: string; name: string }) {
  return (
    <div className="w-14 h-14 mx-auto mb-3 flex items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logo}
        alt={name}
        className="w-full h-full object-contain"
        onError={(e) => {
          // fallback to initials shield if image fails
          const el = e.currentTarget;
          el.style.display = "none";
          el.nextElementSibling?.removeAttribute("hidden");
        }}
      />
      <span hidden className="font-heading font-black text-[10px] tracking-wider" style={{ color }}>
        {initials}
      </span>
    </div>
  );
}

export default function PlayerProfile() {
  const { t } = useLang();
  const p = t.profile;

  const stats = [
    { label: p.labels.position,    value: "ST / LW" },
    { label: p.labels.age,         value: "18" },
    { label: p.labels.height,      value: "187 cm" },
    { label: p.labels.weight,      value: "78 kg" },
    { label: p.labels.nationality, value: p.values.nationality },
    { label: p.labels.club,        value: "SC Staaken" },
    { label: p.labels.strongFoot,  value: p.values.strongFoot, accent: "10 / 10" },
    { label: p.labels.weakFoot,    value: p.values.weakFoot,   accent: "8 / 10" },
  ];

  return (
    <section
      id="profile"
      className="bg-[#080808] py-20 sm:py-28 border-t border-[#111]"
      aria-labelledby="profile-heading"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8">

        {/* Section Header */}
        <div className="mb-12 sm:mb-16">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-6 h-px bg-[#e11d48]" />
            <span className="text-zinc-500 text-xs font-semibold tracking-[0.25em] uppercase">{p.eyebrow}</span>
          </div>
          <h2
            id="profile-heading"
            className="font-heading font-black text-white uppercase leading-none"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
          >
            {p.heading1}<br />{p.heading2}
          </h2>
          <div className="mt-6 w-10 h-1 bg-[#e11d48]" />
        </div>

        {/* Bio + Stats grid side by side on desktop */}
        <div className="grid lg:grid-cols-[1fr_360px] gap-12 lg:gap-20 items-start">

          {/* Bio paragraphs */}
          <div className="space-y-5 text-zinc-400 text-base sm:text-[1.05rem] leading-relaxed">
            <p>{p.p1}</p>
            <p>{p.p2}</p>
            <p>{p.p3}</p>
            <blockquote className="text-zinc-200 font-medium border-l-2 border-[#e11d48] pl-4 mt-6 not-italic">
              {p.quote}
            </blockquote>
          </div>

          {/* Stats */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-4 h-px bg-[#e11d48]" />
              <span className="text-zinc-500 text-[10px] font-semibold tracking-[0.25em] uppercase">
                {p.statsEyebrow}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-px bg-[#1e1e1e]">
              {stats.map(({ label, value, accent }) => (
                <div
                  key={label}
                  className="bg-[#0d0d0d] hover:bg-[#121212] transition-colors duration-200 p-4 sm:p-5"
                >
                  <div className="text-zinc-600 text-[10px] font-semibold tracking-[0.2em] uppercase mb-2">
                    {label}
                  </div>
                  <div className="font-heading font-bold text-white text-lg sm:text-xl leading-tight">
                    {value}
                  </div>
                  {accent && (
                    <div className="text-[#e11d48] text-xs font-bold mt-1 tracking-wide">{accent}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Career History */}
        <div className="mt-20 pt-16 border-t border-[#161616]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-4 h-px bg-[#e11d48]" />
            <span className="text-zinc-500 text-[10px] font-semibold tracking-[0.25em] uppercase">
              {p.careerEyebrow}
            </span>
          </div>
          <h3 className="font-heading font-bold text-white uppercase text-2xl sm:text-3xl mb-10">
            {p.careerHeading}
          </h3>

          {/* Club cards — horizontal scroll on mobile, wrap on desktop */}
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-5 px-5 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0 lg:flex-wrap">
            {CLUBS.map((club, i) => (
              <div
                key={i}
                className="shrink-0 flex flex-col items-center bg-[#0d0d0d] border border-[#1e1e1e] hover:border-[#2a2a2a] transition-colors duration-200 p-5 w-[130px] sm:w-[148px]"
              >
                <ClubLogo logo={club.logo} initials={club.initials} color={club.color} name={club.name} />
                <p className="text-white font-heading font-bold text-[11px] sm:text-xs uppercase leading-tight tracking-wide text-center mb-2.5">
                  {club.name}
                </p>
                <div className="flex flex-wrap justify-center gap-1">
                  {club.ageGroups.map((ag) => (
                    <span
                      key={ag}
                      className="inline-block text-[10px] font-bold tracking-[0.15em] uppercase px-2 py-0.5"
                      style={{
                        color: club.color,
                        backgroundColor: `${club.color}18`,
                        border: `1px solid ${club.color}30`,
                      }}
                    >
                      {ag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

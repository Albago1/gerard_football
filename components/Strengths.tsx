import { JSX } from "react";

type Strength = {
  icon: JSX.Element;
  title: string;
  desc: string;
};

const IconTarget = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6" aria-hidden="true">
    <path d="M5 19L19 5" strokeLinecap="round" />
    <path d="M9 5h10v10" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconDuel = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6" aria-hidden="true">
    <path d="M8 21l-3-3 7-7-4-4 3-3 7 7-3 3-7 7z" strokeLinejoin="round" />
    <path d="M16 3l3 3" strokeLinecap="round" />
    <path d="M8 16l-3 3" strokeLinecap="round" />
  </svg>
);

const IconStar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6" aria-hidden="true">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinejoin="round" />
  </svg>
);

const IconFeet = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6" aria-hidden="true">
    <path d="M7 3h10M7 3a4 4 0 0 0 0 8h10a4 4 0 0 0 0-8M7 21h10M7 21a4 4 0 0 1 0-8h10a4 4 0 0 1 0 8" strokeLinejoin="round" />
  </svg>
);

const strengths: Strength[] = [
  {
    icon: <IconTarget />,
    title: "Finishing",
    desc: "Clinical in front of goal. Consistent under pressure with both feet — from range and tight angles.",
  },
  {
    icon: <IconArrow />,
    title: "Direct Runs",
    desc: "Aggressive vertical runs in behind the line. Exploits space and challenges the offside trap.",
  },
  {
    icon: <IconDuel />,
    title: "1v1 Attacking",
    desc: "Comfortable taking on defenders with pace and technique. Uses body feints and sharp change of direction.",
  },
  {
    icon: <IconStar />,
    title: "Chance Creation",
    desc: "Reads the game to create dangerous situations — through individual actions and combination play.",
  },
  {
    icon: <IconShield />,
    title: "Defensive Work Rate",
    desc: "Presses from the front, tracks back when needed. Contributes defensively and sets the tone for the team.",
  },
  {
    icon: <IconFeet />,
    title: "Two-Footed",
    desc: "Right 10/10 · Left 8/10. Equally dangerous from both sides — keeps defenders constantly guessing.",
  },
];

export default function Strengths() {
  return (
    <section
      id="strengths"
      className="bg-[#0a0a0a] py-20 sm:py-28 border-t border-[#141414]"
      aria-labelledby="strengths-heading"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-6 h-px bg-[#e11d48]" />
          <span className="text-zinc-500 text-xs font-semibold tracking-[0.25em] uppercase">
            What I Bring
          </span>
        </div>
        <h2
          id="strengths-heading"
          className="font-heading font-black text-white uppercase leading-none mb-14"
          style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
        >
          Key Strengths
        </h2>

        {/* Grid — gap-px + bg creates hairline borders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1a1a1a]">
          {strengths.map(({ icon, title, desc }) => (
            <article
              key={title}
              className="group bg-[#0a0a0a] hover:bg-[#101010] transition-colors duration-200 p-8"
            >
              <div className="text-[#e11d48] mb-5 transition-transform duration-200 group-hover:scale-110 w-fit">
                {icon}
              </div>
              <h3 className="font-heading font-bold text-white uppercase text-xl tracking-wide mb-3">
                {title}
              </h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

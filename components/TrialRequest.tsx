export default function TrialRequest() {
  return (
    <section
      id="trial"
      className="relative bg-[#e11d48] py-20 sm:py-32 overflow-hidden"
      aria-labelledby="trial-heading"
    >
      {/* Hatched texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, #000 0, #000 1px, transparent 0, transparent 50%)",
          backgroundSize: "10px 10px",
        }}
      />

      {/* Giant decorative "1" */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 font-heading font-black text-black/[0.05] leading-none pointer-events-none select-none hidden lg:block"
        style={{ fontSize: "28rem" }}
        aria-hidden="true"
      >
        1
      </div>

      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 text-center">
        {/* Section label */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="w-8 h-px bg-white/30" />
          <span className="text-white/50 text-xs font-semibold tracking-[0.3em] uppercase">
            The Proposition
          </span>
          <div className="w-8 h-px bg-white/30" />
        </div>

        {/* Quote */}
        <blockquote>
          <p
            id="trial-heading"
            className="font-heading font-black text-white uppercase leading-[0.95] mb-6"
            style={{ fontSize: "clamp(2rem, 5.5vw, 4.5rem)" }}
          >
            "I only need one chance
            <br />
            to show my level."
          </p>
          <footer className="text-white/65 text-lg sm:text-xl font-light mb-12 leading-relaxed">
            If it does not fit, the club loses nothing.
          </footer>
        </blockquote>

        {/* CTA */}
        <a
          href="#contact"
          className="inline-block bg-white text-[#e11d48] font-heading font-black text-sm uppercase tracking-[0.2em] px-10 py-5 hover:bg-zinc-100 active:bg-zinc-200 transition-colors duration-200"
        >
          Invite Gerard for Trial
        </a>

        {/* Trust signals */}
        <ul
          className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-14 text-white/40 text-xs tracking-widest uppercase"
          aria-label="Key facts"
        >
          <li>Age 18</li>
          <li aria-hidden="true">·</li>
          <li>Berlin Based</li>
          <li aria-hidden="true">·</li>
          <li>Available Immediately</li>
          <li aria-hidden="true">·</li>
          <li>No Transfer Fee</li>
          <li aria-hidden="true">·</li>
          <li>Two-Footed</li>
        </ul>
      </div>
    </section>
  );
}

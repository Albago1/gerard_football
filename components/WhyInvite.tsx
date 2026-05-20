const reasons = [
  {
    number: "01",
    title: "Direct attacking profile",
    body: "He attacks with intent. Every run, every decision in the final third points forward — no hesitation when it matters. Give him space between the lines and he punishes it.",
  },
  {
    number: "02",
    title: "Two-footed finishing",
    body: "Right foot is his main weapon (10/10). Left foot finishes cleanly in tight spaces (8/10). That combination keeps defenders guessing in a way that one-footed players simply cannot.",
  },
  {
    number: "03",
    title: "Hungry to prove himself",
    body: "He's 18, he's at U18 level, and he knows what that means. He's not asking for a contract — he's asking for one training session. If it's not there, the club loses nothing.",
  },
];

export default function WhyInvite() {
  return (
    <section
      id="why"
      className="bg-[#0d0d0d] py-20 sm:py-28 border-t border-[#161616]"
      aria-labelledby="why-heading"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-6 h-px bg-[#e11d48]" />
          <span className="text-zinc-500 text-xs font-semibold tracking-[0.25em] uppercase">
            The Case for Gerard
          </span>
        </div>
        <h2
          id="why-heading"
          className="font-heading font-black text-white uppercase leading-none mb-16"
          style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
        >
          Why Invite Gerard?
        </h2>

        {/* Reasons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1a1a1a]">
          {reasons.map(({ number, title, body }) => (
            <div
              key={number}
              className="bg-[#0d0d0d] p-8 sm:p-10 flex flex-col gap-5"
            >
              {/* Number */}
              <span className="font-heading font-black text-[#e11d48] text-5xl leading-none">
                {number}
              </span>

              {/* Title */}
              <h3 className="font-heading font-bold text-white uppercase text-xl sm:text-2xl leading-tight">
                {title}
              </h3>

              {/* Body */}
              <p className="text-zinc-500 text-sm sm:text-base leading-relaxed flex-1">
                {body}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-8 border-t border-[#161616]">
          <p className="text-zinc-500 text-base sm:text-lg">
            Seen enough?{" "}
            <span className="text-white font-medium">
              Give him one session on the pitch.
            </span>
          </p>
          <a
            href="#contact"
            className="shrink-0 bg-[#e11d48] hover:bg-[#be123c] text-white font-bold px-8 py-4 uppercase tracking-[0.15em] text-sm transition-colors duration-200"
          >
            Arrange a Trial
          </a>
        </div>

      </div>
    </section>
  );
}

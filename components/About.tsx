export default function About() {
  return (
    <section
      id="about"
      className="bg-[#080808] py-20 sm:py-28"
      aria-labelledby="about-heading"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-12 lg:gap-24 items-start">

          {/* Left col */}
          <div className="lg:pt-2">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-6 h-px bg-[#e11d48]" />
              <span className="text-zinc-500 text-xs font-semibold tracking-[0.25em] uppercase">
                Who He Is
              </span>
            </div>
            <h2
              id="about-heading"
              className="font-heading font-black text-white uppercase leading-none"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
            >
              Player
              <br />
              Profile
            </h2>
            <div className="mt-8 w-10 h-1 bg-[#e11d48]" />
          </div>

          {/* Right col — bio */}
          <div className="space-y-6 text-zinc-400 text-base sm:text-[1.05rem] leading-relaxed">
            <p>
              Gerard Gani is 18, based in Berlin, and plays for SC Staaken
              U18. He's a striker first, left winger when needed — his game
              is built around one thing: getting into positions to score and
              creating problems for defenders.
            </p>
            <p>
              He's two-footed. Right foot rated 10/10, left at 8/10. That's
              not a marketing line — it means he can finish from both sides in
              tight spaces, cut inside or go wide, and keep defenders honest
              in every situation.
            </p>
            <p>
              At 187 cm and 78 kg he's physically ready for senior football.
              He presses from the front, wins the ball back in dangerous areas,
              and doesn't jog back when the team loses possession. The
              defensive side of the game is not an afterthought for him.
            </p>
            <p className="text-zinc-200 font-medium border-l-2 border-[#e11d48] pl-4">
              He is available for trial immediately. No contract required
              to take a look — one training session is enough to judge.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

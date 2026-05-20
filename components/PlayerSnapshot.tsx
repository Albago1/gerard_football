const stats = [
  { label: "Position", value: "ST / LW" },
  { label: "Age", value: "18" },
  { label: "Height", value: "187 cm" },
  { label: "Weight", value: "78 kg" },
  { label: "Nationality", value: "Albanian" },
  { label: "Current Club", value: "SC Staaken U18" },
  { label: "Strong Foot", value: "Right", accent: "10 / 10" },
  { label: "Weak Foot", value: "Left", accent: "8 / 10" },
];

export default function PlayerSnapshot() {
  return (
    <section
      id="stats"
      className="bg-[#0d0d0d] py-16 sm:py-20 border-y border-[#161616]"
      aria-labelledby="snapshot-heading"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-6 h-px bg-[#e11d48]" />
          <span className="text-zinc-500 text-xs font-semibold tracking-[0.25em] uppercase">
            Player Profile
          </span>
        </div>
        <h2
          id="snapshot-heading"
          className="font-heading font-black text-white uppercase text-4xl sm:text-5xl mb-10"
        >
          At a Glance
        </h2>

        {/* Stats grid — separated by 1px borders using gap + background trick */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#1e1e1e]">
          {stats.map(({ label, value, accent }) => (
            <div
              key={label}
              className="bg-[#0d0d0d] hover:bg-[#121212] transition-colors duration-200 p-5 sm:p-7"
            >
              <div className="text-zinc-600 text-[10px] font-semibold tracking-[0.2em] uppercase mb-2.5">
                {label}
              </div>
              <div className="font-heading font-bold text-white text-xl sm:text-2xl leading-tight">
                {value}
              </div>
              {accent && (
                <div className="text-[#e11d48] text-xs font-bold mt-1.5 tracking-wide">
                  {accent}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

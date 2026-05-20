/*
 * HOW TO ADD YOUR VIDEO LINKS
 * ─────────────────────────────────────────────────────────
 * When your highlight video is ready, find the two video
 * placeholders below and replace the placeholder content
 * with an <iframe> or <a> tag.
 *
 * YouTube embed:   https://www.youtube.com/embed/VIDEO_ID
 * Vimeo embed:     https://player.vimeo.com/video/VIDEO_ID
 * Google Drive:    https://drive.google.com/file/d/FILE_ID/preview
 *
 * Or simply update the `href` prop on each VideoCard below.
 */

type VideoCardProps = {
  badge: string;
  badgeStyle: "red" | "outline";
  title: string;
  status: string;
  detail: string;
  cta: string;
  // REPLACE: Add href prop with your actual video URL when ready
  href?: string;
};

function VideoCard({ badge, badgeStyle, title, status, detail, cta, href }: VideoCardProps) {
  const badgeClass =
    badgeStyle === "red"
      ? "bg-[#e11d48] text-white"
      : "border border-zinc-700 text-zinc-400";

  return (
    <figure className="flex flex-col">
      {/* Frame */}
      <div className="relative bg-[#0f0f0f] border border-[#1e1e1e] aspect-video flex flex-col items-center justify-center overflow-hidden group">
        {/* Diagonal stripe texture */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
            backgroundSize: "18px 18px",
          }}
          aria-hidden="true"
        />

        {/* Centre content */}
        <div className="relative z-10 flex flex-col items-center gap-5 px-6 text-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-full border-2 border-white/10 flex items-center justify-center">
            {badgeStyle === "red" ? (
              /* Highlight reel — play icon */
              <svg className="w-6 h-6 text-white/40 ml-0.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              /* Full match — film icon */
              <svg className="w-6 h-6 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="2" />
                <path d="M7 2v20M17 2v20M2 12h20M2 7h5M17 7h5M2 17h5M17 17h5" />
              </svg>
            )}
          </div>

          <div>
            <p className="font-heading font-bold text-white text-xl uppercase tracking-wide mb-1">
              {title}
            </p>
            <p className="text-zinc-500 text-sm">{status}</p>
          </div>

          <p className="text-zinc-600 text-xs max-w-xs leading-relaxed">{detail}</p>
        </div>

        {/* Badge */}
        <div
          className={`absolute top-4 left-4 text-[10px] font-bold px-3 py-1 uppercase tracking-[0.15em] ${badgeClass}`}
        >
          {badge}
        </div>
      </div>

      {/* CTA below frame */}
      <figcaption className="mt-4">
        <a
          href="#contact"
          className="inline-flex items-center gap-2 text-[#e11d48] text-xs font-bold uppercase tracking-[0.15em] hover:text-white transition-colors duration-200 group/link"
        >
          <span className="w-4 h-px bg-[#e11d48] group-hover/link:bg-white transition-colors duration-200 shrink-0" />
          {/* REPLACE: Change this text if you have an actual link ready */}
          {cta}
        </a>
      </figcaption>
    </figure>
  );
}

export default function Videos() {
  return (
    <section
      id="videos"
      className="bg-[#080808] py-20 sm:py-28 border-t border-[#111]"
      aria-labelledby="videos-heading"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-6 h-px bg-[#e11d48]" />
          <span className="text-zinc-500 text-xs font-semibold tracking-[0.25em] uppercase">
            Watch Him Play
          </span>
        </div>
        <h2
          id="videos-heading"
          className="font-heading font-black text-white uppercase leading-none mb-4"
          style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
        >
          Footage
        </h2>
        <p className="text-zinc-500 text-base mb-14 max-w-xl leading-relaxed">
          Highlights are being compiled. Full match footage is available now —
          just ask.
        </p>

        {/* Video grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          <VideoCard
            badge="Coming Soon"
            badgeStyle="red"
            title="Highlight Reel"
            status="Highlights coming soon — Season 2024/25"
            detail="Best goals, assists, and key moments. Will be published here once compiled. Check back soon."
            cta="Get notified — contact Gerard"
          />
          <VideoCard
            badge="Available Now"
            badgeStyle="outline"
            title="Full Match Footage"
            status="Available immediately on request"
            detail="Complete 90-minute footage showing movement, positioning, work rate, and attacking play. Sent directly on request."
            cta="Request match footage"
          />
        </div>

        {/* Request note */}
        <div className="mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-6 border border-[#1e1e1e] bg-[#0d0d0d]">
          <div>
            <p className="text-white font-semibold text-sm mb-1">
              Need footage before deciding?
            </p>
            <p className="text-zinc-500 text-sm">
              Additional clips — training, set pieces, 1v1 situations — available on request.
            </p>
          </div>
          <a
            href="#contact"
            className="shrink-0 border border-zinc-700 hover:border-white text-white text-xs font-bold px-6 py-3 uppercase tracking-[0.15em] transition-colors duration-200"
          >
            Request Footage
          </a>
        </div>

      </div>
    </section>
  );
}

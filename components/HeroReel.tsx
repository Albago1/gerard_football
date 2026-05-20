"use client";

import { useState, useEffect, useRef } from "react";
import { useLang } from "@/lib/i18n";
import type { Clip } from "@/lib/clips-store";

function ytId(url: string) {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&\s?/]+)/
  );
  return m?.[1] ?? null;
}

function FeaturedPlayer({ clip }: { clip: Clip }) {
  const [playing, setPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const id = clip.videoUrl ? ytId(clip.videoUrl) : null;
  const thumb =
    clip.thumbnailUrl ??
    (id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null);

  // Autoplay when 60 % of the card scrolls into view
  useEffect(() => {
    if (!id) return;
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPlaying(true);
          obs.disconnect();
        }
      },
      { threshold: 0.6 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [id]);

  const src = id
    ? `https://www.youtube.com/embed/${id}?autoplay=${playing ? 1 : 0}&mute=1&loop=1&playlist=${id}&rel=0&modestbranding=1&controls=1`
    : null;

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-[#0a0a0a] border border-[#1e1e1e] overflow-hidden"
      style={{ aspectRatio: "9/16" }}
    >
      {/* Thumbnail shown until autoplay fires */}
      {thumb && !playing && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumb}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Gradient overlay on thumbnail */}
      {!playing && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      )}

      {/* Play hint */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full border border-white/20 bg-black/30 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-6 h-6 text-white ml-1" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* YouTube iframe — rendered from the start so it loads early; visible once playing */}
      {src && (
        <iframe
          src={src}
          className={`absolute inset-0 w-full h-full border-0 transition-opacity duration-500 ${playing ? "opacity-100" : "opacity-0"}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={clip.title}
        />
      )}

      {/* Title bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent z-10">
        <p className="font-heading font-bold text-white uppercase text-base sm:text-lg leading-tight tracking-wide">
          {clip.title}
        </p>
        {clip.description && (
          <p className="text-zinc-400 text-xs mt-1 leading-relaxed line-clamp-2">
            {clip.description}
          </p>
        )}
      </div>
    </div>
  );
}

function MiniCard({ clip, onClick }: { clip: Clip; onClick: () => void }) {
  const id = clip.videoUrl ? ytId(clip.videoUrl) : null;
  const thumb =
    clip.thumbnailUrl ??
    (id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative shrink-0 w-[100px] sm:w-[120px] bg-[#0f0f0f] border border-[#1e1e1e] hover:border-[#e11d48]/50 overflow-hidden transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e11d48]"
      style={{ aspectRatio: "9/16" }}
      aria-label={clip.title}
    >
      {thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumb} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-[#111]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center">
          <svg className="w-3 h-3 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-2">
        <p className="font-heading font-bold text-white text-[10px] uppercase leading-tight line-clamp-2 tracking-wide">
          {clip.title}
        </p>
      </div>
    </button>
  );
}

export default function HeroReel() {
  const { t } = useLang();
  const r = t.heroReel;
  const [clips, setClips] = useState<Clip[]>([]);
  const [featured, setFeatured] = useState(0);

  useEffect(() => {
    fetch("/api/clips")
      .then((res) => res.json())
      .then((data: unknown) => {
        if (Array.isArray(data) && data.length > 0) {
          // Sort by category order, then by clip order — goals first
          const sorted = [...data].sort((a, b) => {
            const catOrder = ["goals", "assists", "dribbling", "movement", "pressing", "physical"];
            const ai = catOrder.indexOf(a.category);
            const bi = catOrder.indexOf(b.category);
            if (ai !== bi) return ai - bi;
            return a.order - b.order;
          });
          setClips(sorted.slice(0, 6));
        }
      })
      .catch(() => {});
  }, []);

  if (clips.length === 0) return null;

  const featuredClip = clips[featured];
  const rest = clips.filter((_, i) => i !== featured);

  return (
    <section
      className="bg-[#060606] py-16 sm:py-24 border-t border-[#111]"
      aria-labelledby="heroreel-heading"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-5 h-px bg-[#e11d48]" />
              <span className="text-zinc-500 text-xs font-semibold tracking-[0.25em] uppercase">
                {r.eyebrow}
              </span>
            </div>
            <h2
              id="heroreel-heading"
              className="font-heading font-black text-white uppercase leading-none"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
            >
              {r.heading}
            </h2>
          </div>
          <a
            href="#videos"
            className="hidden sm:flex items-center gap-2 text-zinc-500 hover:text-white text-xs font-semibold uppercase tracking-[0.15em] transition-colors duration-200 shrink-0"
          >
            {r.cta}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Layout: featured clip + sidebar on desktop, stacked on mobile */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

          {/* Featured clip — 9:16 */}
          <div className="w-full lg:w-auto lg:flex-shrink-0" style={{ maxWidth: "300px" }}>
            <FeaturedPlayer key={featured} clip={featuredClip} />
          </div>

          {/* Rest of clips — vertical on desktop, horizontal scroll on mobile */}
          <div className="w-full">
            {/* Mobile: horizontal scroll */}
            <div className="flex lg:hidden gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {rest.map((clip, i) => (
                <MiniCard
                  key={clip.id}
                  clip={clip}
                  onClick={() => setFeatured(clips.indexOf(clip))}
                />
              ))}
            </div>

            {/* Desktop: grid */}
            <div className="hidden lg:grid grid-cols-2 xl:grid-cols-3 gap-3">
              {rest.map((clip) => (
                <MiniCard
                  key={clip.id}
                  clip={clip}
                  onClick={() => setFeatured(clips.indexOf(clip))}
                />
              ))}
            </div>

            {/* Browse CTA — mobile only */}
            <a
              href="#videos"
              className="sm:hidden mt-5 flex items-center gap-2 text-zinc-500 hover:text-white text-xs font-semibold uppercase tracking-[0.15em] transition-colors duration-200"
            >
              {r.cta}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { useLang } from "@/lib/i18n";
import { optimizeCloudinary } from "@/lib/cloudinary";
import type { Clip } from "@/lib/clips-store";

// ── URL resolver ──────────────────────────────────────────────────────────────

type Embed =
  | { kind: "youtube"; id: string }
  | { kind: "vimeo";   id: string }
  | { kind: "video";   src: string }
  | { kind: "none" };

function resolveEmbed(url?: string): Embed {
  if (!url) return { kind: "none" };

  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&\s?/]+)/
  );
  if (yt) return { kind: "youtube", id: yt[1] };

  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return { kind: "vimeo", id: vimeo[1] };

  if (url.includes("drive.google.com")) return { kind: "none" };

  return { kind: "video", src: optimizeCloudinary(url) };
}

function getAutoThumb(embed: Embed, clip: Clip): string {
  if (clip.thumbnailUrl) return optimizeCloudinary(clip.thumbnailUrl);
  if (embed.kind === "youtube")
    return `https://img.youtube.com/vi/${embed.id}/hqdefault.jpg`;
  return `/thumbnails/${clip.category}.jpg`;
}

// ── Date helpers ──────────────────────────────────────────────────────────────

const NEW_BADGE_DAYS = 30;

function isNewClip(clip: Clip): boolean {
  if (!clip.createdAt) return false;
  const t = new Date(clip.createdAt).getTime();
  if (Number.isNaN(t)) return false;
  const days = (Date.now() - t) / (1000 * 60 * 60 * 24);
  return days >= 0 && days < NEW_BADGE_DAYS;
}

function formatMatchDate(iso: string | undefined, lang: "en" | "de"): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(lang === "de" ? "de-DE" : "en-US", {
    month: "long",
    year: "numeric",
  });
}

// ── Featured Player ───────────────────────────────────────────────────────────

type FeaturedProps = {
  clip: Clip;
  inView: boolean;
  paused: boolean;
  onEnded: () => void;
  onProgress: (ratio: number) => void;
};

function FeaturedPlayer({ clip, inView, paused, onEnded, onProgress }: FeaturedProps) {
  const { lang } = useLang();
  const [showThumb, setShowThumb] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const embed    = resolveEmbed(clip.videoUrl);
  const thumb    = getAutoThumb(embed, clip);
  const fresh    = isNewClip(clip);
  const matchStr = formatMatchDate(clip.matchDate, lang);

  // When we transition into the paused state, force the thumbnail back on so
  // the next replay (which may not change the clip index, e.g. single-clip
  // reel) starts from a thumbnail rather than a blank frame.
  const [prevPaused, setPrevPaused] = useState(paused);
  if (prevPaused !== paused) {
    setPrevPaused(paused);
    if (paused) setShowThumb(true);
  }

  // For iframes (YouTube/Vimeo) we can't detect when they actually start
  // rendering, so we fade the thumbnail away after a short delay.
  useEffect(() => {
    if (paused) return;
    if (embed.kind === "youtube" || embed.kind === "vimeo") {
      const t = setTimeout(() => setShowThumb(false), 700);
      return () => clearTimeout(t);
    }
  }, [embed.kind, paused]);

  // Some desktop browsers ignore the autoPlay attribute on mount if `muted`
  // wasn't synchronously true at the time the element was attached to the
  // DOM (a React quirk). Force muted + .play() imperatively as a backup.
  useEffect(() => {
    if (paused) return;
    if (embed.kind !== "video") return;
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
    const t = setTimeout(tryPlay, 250);
    return () => clearTimeout(t);
  }, [embed.kind, clip.videoUrl, paused]);

  // Pause/resume native video when reel scrolls in or out of view —
  // saves Cloudinary bandwidth when nobody's watching.
  useEffect(() => {
    if (embed.kind !== "video") return;
    const v = videoRef.current;
    if (!v) return;
    if (inView && !paused) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [inView, embed.kind, paused]);

  // YouTube / Vimeo embed src — autoplay muted, looped (parent advances on a timer)
  let iframeSrc: string | null = null;
  if (embed.kind === "youtube") {
    iframeSrc = `https://www.youtube.com/embed/${embed.id}?autoplay=1&mute=1&loop=1&playlist=${embed.id}&rel=0&modestbranding=1&controls=1&playsinline=1`;
  } else if (embed.kind === "vimeo") {
    iframeSrc = `https://player.vimeo.com/video/${embed.id}?autoplay=1&muted=1&loop=1&title=0&byline=0&portrait=0`;
  }

  // When paused (cycle done), keep the thumbnail visible and skip the play icon —
  // the parent overlays a "Play again" button on top instead.
  const thumbVisible = showThumb || paused;

  return (
    <div className="relative w-full bg-[#0a0a0a] border border-[#1e1e1e] overflow-hidden" style={{ aspectRatio: "9/16" }}>
      {/* Thumbnail (covers the video until it starts playing) */}
      {thumb && thumbVisible && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumb}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover z-[5]"
        />
      )}
      {showThumb && !paused && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-[5]" />
          <div className="absolute inset-0 flex items-center justify-center z-[5]">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-white/95 bg-black/55 backdrop-blur-sm shadow-2xl shadow-black/60 flex items-center justify-center">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white ml-1" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </>
      )}

      {/* Iframe is unmounted when paused so YouTube/Vimeo stop streaming. */}
      {iframeSrc && !paused && (
        <iframe
          src={iframeSrc}
          className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={clip.title}
        />
      )}

      {/* Native video — autoplay muted, no loop so onEnded fires and we can advance */}
      {embed.kind === "video" && !paused && (
        <video
          ref={videoRef}
          src={embed.src}
          autoPlay
          muted
          playsInline
          preload="auto"
          onPlaying={() => setShowThumb(false)}
          onEnded={onEnded}
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            if (v.duration > 0 && Number.isFinite(v.duration)) {
              onProgress(v.currentTime / v.duration);
            }
          }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* NEW badge */}
      {fresh && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2 py-1 bg-[#e11d48] text-white text-[9px] font-bold uppercase tracking-widest">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
          </span>
          New
        </div>
      )}

      {/* Title + match date */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent z-10">
        <p className="font-heading font-bold text-white uppercase text-base sm:text-lg leading-tight tracking-wide">
          {clip.title}
        </p>
        {(clip.description || matchStr) && (
          <p className="text-zinc-400 text-xs mt-1 leading-relaxed line-clamp-2">
            {clip.description}
            {clip.description && matchStr && (
              <span className="text-zinc-600"> · </span>
            )}
            {matchStr && (
              <span className="text-[#e11d48] font-semibold uppercase tracking-wider">
                {matchStr}
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Mini Card ─────────────────────────────────────────────────────────────────

function MiniCard({ clip, onClick }: { clip: Clip; onClick: () => void }) {
  const embed = resolveEmbed(clip.videoUrl);
  const thumb = getAutoThumb(embed, clip);
  const fresh = isNewClip(clip);

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

      {fresh && (
        <div className="absolute top-1.5 left-1.5 px-1 py-0.5 bg-[#e11d48] text-white text-[7px] font-bold uppercase tracking-widest">
          New
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white/95 bg-black/55 backdrop-blur-sm shadow-xl shadow-black/50 flex items-center justify-center">
          <svg className="w-4 h-4 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
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

// ── HeroReel ──────────────────────────────────────────────────────────────────

// We can't reliably detect when a YouTube/Vimeo iframe finishes playing without
// loading their JS APIs, so we use a generous fallback timer for those.
const IFRAME_FALLBACK_MS = 25_000;
const TICK_MS = 100;

const FALLBACK_CAT_ORDER = ["goals", "assists", "dribbling", "movement", "pressing", "physical"];

export default function HeroReel() {
  const { t } = useLang();
  const r = t.heroReel;
  const [clips, setClips] = useState<Clip[]>([]);
  const [featured, setFeatured] = useState(0);
  const [progress, setProgress] = useState(0);
  const [inView, setInView] = useState(false);
  // After one full pass through the curated list we freeze playback to keep
  // Cloudinary bandwidth bounded. A "Play again" overlay lets the visitor restart.
  const [cycleDone, setCycleDone] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Track whether the reel is visible — pause playback + rotation when offscreen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Load clips: prefer curated reel, fall back to top 6 by category order
  useEffect(() => {
    fetch("/api/clips")
      .then((res) => res.json())
      .then((data: unknown) => {
        if (!Array.isArray(data) || data.length === 0) return;

        const featuredList = (data as Clip[]).filter((c) => c.featuredInReel);

        let chosen: Clip[];
        if (featuredList.length > 0) {
          chosen = [...featuredList].sort(
            (a, b) => (a.reelOrder ?? 0) - (b.reelOrder ?? 0)
          );
        } else {
          chosen = [...(data as Clip[])].sort((a, b) => {
            const ai = FALLBACK_CAT_ORDER.indexOf(a.category);
            const bi = FALLBACK_CAT_ORDER.indexOf(b.category);
            if (ai !== bi) return ai - bi;
            return a.order - b.order;
          });
        }

        const playable = chosen.filter(
          (c) => resolveEmbed(c.videoUrl).kind !== "none"
        );
        setClips(playable.slice(0, 6));
      })
      .catch(() => {});
  }, []);

  const featuredClip = clips[featured];
  const featuredKind = featuredClip
    ? resolveEmbed(featuredClip.videoUrl).kind
    : "none";

  // Reset progress when the featured clip changes — derived during render
  // rather than via setState-in-effect, which would trigger a cascading render.
  // See: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevFeatured, setPrevFeatured] = useState(featured);
  if (prevFeatured !== featured) {
    setPrevFeatured(featured);
    setProgress(0);
  }

  // For YouTube/Vimeo we don't know when the video ends, so use a fallback timer.
  // Native videos drive the timer themselves via onEnded / onTimeUpdate.
  // Skip the timer entirely when offscreen or after the cycle finishes —
  // no point advancing clips no one is watching.
  useEffect(() => {
    if (clips.length === 0) return;
    if (!inView || cycleDone) return;
    if (featuredKind !== "youtube" && featuredKind !== "vimeo") return;

    let step = 0;
    const id = setInterval(() => {
      step += 1;
      const total = IFRAME_FALLBACK_MS / TICK_MS;
      if (step >= total) {
        advance();
        step = 0;
      }
      setProgress((step / total) * 100);
    }, TICK_MS);
    return () => clearInterval(id);
    // `advance` is stable in closure since it reads from current state via setter callbacks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featured, clips.length, featuredKind, inView, cycleDone]);

  function advance() {
    setFeatured((f) => {
      if (f >= clips.length - 1) {
        setCycleDone(true);
        return f;
      }
      return f + 1;
    });
  }

  function handleEnded() {
    advance();
  }

  function replay() {
    setCycleDone(false);
    setFeatured(0);
    setProgress(0);
  }

  function jumpTo(index: number) {
    setCycleDone(false);
    setFeatured(index);
  }

  function handleProgress(ratio: number) {
    setProgress(Math.max(0, Math.min(100, ratio * 100)));
  }

  if (clips.length === 0) return null;
  if (!featuredClip) return null;

  const rest = clips.filter((_, i) => i !== featured);

  return (
    <section
      ref={sectionRef}
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

        {/* Layout */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

          {/* Featured clip — 9:16, real-time progress bar at bottom.
              Explicit width on desktop so the inner aspect-ratio div doesn't
              collapse to 0 inside the flex row. */}
          <div className="w-full lg:w-[300px] lg:flex-shrink-0 mx-auto lg:mx-0 relative" style={{ maxWidth: "300px" }}>
            <FeaturedPlayer
              key={`${featured}-${featuredClip.id}`}
              clip={featuredClip}
              inView={inView}
              paused={cycleDone}
              onEnded={handleEnded}
              onProgress={handleProgress}
            />
            {clips.length > 1 && !cycleDone && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-black/40 z-20 overflow-hidden">
                <div
                  className="h-full bg-[#e11d48] transition-[width] duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            {cycleDone && (
              <button
                type="button"
                onClick={replay}
                className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/55 backdrop-blur-[2px] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e11d48]"
                aria-label={r.replay}
              >
                <div className="w-16 h-16 rounded-full border border-white/40 bg-black/40 flex items-center justify-center transition-transform duration-200 hover:scale-105">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 12a9 9 0 1 1-3.51-7.13" />
                    <polyline points="21 4 21 10 15 10" />
                  </svg>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                  {r.replay}
                </span>
              </button>
            )}
          </div>

          {/* Other clips */}
          <div className="w-full">
            <div className="flex lg:hidden gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {rest.map((clip) => (
                <MiniCard
                  key={clip.id}
                  clip={clip}
                  onClick={() => jumpTo(clips.indexOf(clip))}
                />
              ))}
            </div>

            <div className="hidden lg:grid grid-cols-2 xl:grid-cols-3 gap-3">
              {rest.map((clip) => (
                <MiniCard
                  key={clip.id}
                  clip={clip}
                  onClick={() => jumpTo(clips.indexOf(clip))}
                />
              ))}
            </div>

          </div>
        </div>

        {/* Full-library prompt — bold visual cue so visitors who only watch the
            featured reel still notice the categorized library further down. */}
        <a
          href="#videos"
          className="group relative block mt-10 sm:mt-14 border border-[#e11d48]/30 hover:border-[#e11d48] bg-gradient-to-b from-[#e11d48]/[0.08] to-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e11d48] transition-colors duration-200"
        >
          <span className="pointer-events-none absolute -top-px left-0 w-10 h-px bg-[#e11d48]" aria-hidden="true" />
          <span className="pointer-events-none absolute -top-px right-0 w-10 h-px bg-[#e11d48]" aria-hidden="true" />
          <span className="pointer-events-none absolute -bottom-px left-0 w-10 h-px bg-[#e11d48]" aria-hidden="true" />
          <span className="pointer-events-none absolute -bottom-px right-0 w-10 h-px bg-[#e11d48]" aria-hidden="true" />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 py-7 sm:py-9 px-6 text-center">
            <svg
              className="w-6 h-6 sm:w-7 sm:h-7 text-[#e11d48] animate-bounce shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
            <span className="font-heading font-black text-white uppercase text-xl sm:text-2xl tracking-wide leading-none group-hover:text-[#e11d48] transition-colors duration-200">
              {r.cta}
            </span>
            <svg
              className="w-6 h-6 sm:w-7 sm:h-7 text-[#e11d48] animate-bounce shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </a>
      </div>
    </section>
  );
}

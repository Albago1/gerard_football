"use client";

import { useState, useEffect, useRef, useCallback, type RefObject } from "react";
import { CATEGORIES } from "@/lib/categories";
import { useLang, type Translations } from "@/lib/i18n";
import { clipThumbnail, optimizeCloudinary } from "@/lib/cloudinary";
import type { Clip } from "@/lib/clips-store";

// ── Embed resolver ────────────────────────────────────────────────────────────
// Accepts any URL and returns the right player type.
// YouTube, Vimeo, and Google Drive get an iframe; everything else a <video>.

function resolveEmbed(
  url: string
): { type: "iframe"; src: string } | { type: "video"; src: string } {
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&\s?/]+)/
  );
  if (yt)
    return {
      type: "iframe",
      // autoplay + loop (loop on YouTube requires playlist param set to the same video ID)
      src: `https://www.youtube.com/embed/${yt[1]}?autoplay=1&mute=1&loop=1&playlist=${yt[1]}&rel=0&modestbranding=1&playsinline=1`,
    };

  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo)
    return {
      type: "iframe",
      src: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1&muted=1&loop=1&title=0&byline=0&portrait=0`,
    };

  const drive = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (drive)
    return {
      type: "iframe",
      src: `https://drive.google.com/file/d/${drive[1]}/preview`,
    };

  return { type: "video", src: optimizeCloudinary(url) };
}

function isYouTubeUrl(url: string) {
  return /youtu\.be|youtube\.com/.test(url);
}

// ── Category type used only in this file ─────────────────────────────────────

type CategoryWithClips = {
  id: string;
  label: string;
  title: string;
  description: string;
  clips: Clip[];
};

// ── Clip Modal ────────────────────────────────────────────────────────────────

type ModalProps = {
  category: CategoryWithClips;
  clipIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

function ClipModal({ category, clipIndex, onClose, onNavigate }: ModalProps) {
  const clip = category.clips[clipIndex];
  const total = category.clips.length;
  const hasPrev = clipIndex > 0;
  const hasNext = clipIndex < total - 1;
  // Track vertical swipe (Instagram-style) + horizontal as backup
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const [videoError, setVideoError] = useState(false);

  // Reset the per-clip error flag whenever the user navigates — derived during
  // render to avoid a cascading setState-in-effect. (React 19 lint rule.)
  const [prevClipIndex, setPrevClipIndex] = useState(clipIndex);
  if (prevClipIndex !== clipIndex) {
    setPrevClipIndex(clipIndex);
    setVideoError(false);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // Both arrow axes work: up/down (Instagram-style) and left/right (desktop)
      if ((e.key === "ArrowLeft" || e.key === "ArrowDown") && hasPrev) onNavigate(clipIndex - 1);
      if ((e.key === "ArrowRight" || e.key === "ArrowUp") && hasNext) onNavigate(clipIndex + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hasPrev, hasNext, clipIndex, onClose, onNavigate]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const embed =
    clip.videoUrl && !videoError ? resolveEmbed(clip.videoUrl) : null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/96"
      role="dialog"
      aria-modal="true"
      aria-label={`Clip viewer: ${clip.title}`}
      onClick={onClose}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
      }}
      onTouchEnd={(e) => {
        const dx = touchStartX.current - e.changedTouches[0].clientX;
        const dy = touchStartY.current - e.changedTouches[0].clientY;
        // Use the dominant axis: vertical swipe (Instagram) or horizontal swipe
        if (Math.abs(dy) > Math.abs(dx)) {
          // Vertical: swipe up = next, swipe down = previous
          if (dy > 55 && hasNext) onNavigate(clipIndex + 1);
          if (dy < -55 && hasPrev) onNavigate(clipIndex - 1);
        } else {
          if (dx > 55 && hasNext) onNavigate(clipIndex + 1);
          if (dx < -55 && hasPrev) onNavigate(clipIndex - 1);
        }
      }}
    >
      {/* Close — pinned to the viewport so it's always reachable, even when the
          inner column fills the screen on tall phones. */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="fixed top-3 right-3 sm:top-4 sm:right-4 z-10 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/15 text-white/80 hover:text-white hover:border-white/40 flex items-center justify-center transition-colors"
        style={{ top: "max(0.75rem, env(safe-area-inset-top))" }}
        aria-label="Close clip viewer"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      <div
        className="relative flex flex-col items-center w-full px-1 sm:px-4 max-w-[min(98vw,460px)] sm:max-w-[340px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Category + progress */}
        <div className="flex items-center justify-between w-full mb-2 sm:mb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-px bg-[#e11d48]" />
            <span className="text-zinc-500 text-[10px] font-bold tracking-[0.2em] uppercase">
              {category.title}
            </span>
          </div>
          <span className="text-zinc-700 text-[10px] font-medium tabular-nums">
            {clipIndex + 1} / {total}
          </span>
        </div>

        {/* Video frame — 9:16 */}
        <div
          className="relative w-full bg-[#0a0a0a] border border-[#222] overflow-hidden"
          style={{ aspectRatio: "9/16", maxHeight: "82vh" }}
        >
          {embed ? (
            embed.type === "iframe" ? (
              <iframe
                src={embed.src}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                title={clip.title}
              />
            ) : (
              <video
                // key forces a fresh element on each clip so autoplay always re-fires
                key={clip.id}
                src={embed.src}
                autoPlay
                loop
                muted
                controls
                playsInline
                preload="auto"
                className="absolute inset-0 w-full h-full object-contain"
                aria-label={clip.title}
                onError={() => setVideoError(true)}
              />
            )
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div
                className="absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",
                  backgroundSize: "16px 16px",
                }}
                aria-hidden="true"
              />
              <div className="relative z-10 text-center px-6 flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full border border-[#222] flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-zinc-700"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                  >
                    <rect x="2" y="6" width="20" height="14" rx="2" />
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="12" y1="11" x2="12" y2="17" />
                    <line x1="9" y1="14" x2="15" y2="14" />
                  </svg>
                </div>
                <p className="text-zinc-600 text-[11px] font-bold uppercase tracking-widest">
                  Clip not yet added
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Clip info */}
        <div className="w-full mt-2 sm:mt-3">
          <h3 className="font-heading font-bold text-white uppercase text-xl tracking-wide leading-tight">
            {clip.title}
          </h3>
          {clip.description && (
            <p className="text-zinc-500 text-sm mt-1 leading-relaxed">
              {clip.description}
            </p>
          )}
        </div>

        {/* Dot nav */}
        <div
          className="flex items-center gap-2 mt-3 sm:mt-5"
          role="tablist"
          aria-label="Clip navigation"
        >
          {category.clips.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === clipIndex}
              onClick={() => onNavigate(i)}
              className={`rounded-full transition-all duration-200 ${
                i === clipIndex
                  ? "w-5 h-1.5 bg-[#e11d48]"
                  : "w-1.5 h-1.5 bg-zinc-700 hover:bg-zinc-500"
              }`}
              aria-label={`Go to clip ${i + 1}`}
            />
          ))}
        </div>

        <SwipeHint />
      </div>

      {/* Arrow nav */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (hasPrev) onNavigate(clipIndex - 1);
        }}
        disabled={!hasPrev}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/25 text-white/90 hover:text-white hover:border-white/60 disabled:opacity-0 disabled:pointer-events-none flex items-center justify-center transition-colors"
        aria-label="Previous clip"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (hasNext) onNavigate(clipIndex + 1);
        }}
        disabled={!hasNext}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/25 text-white/90 hover:text-white hover:border-white/60 disabled:opacity-0 disabled:pointer-events-none flex items-center justify-center transition-colors"
        aria-label="Next clip"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}

function SwipeHint() {
  const { t } = useLang();
  return (
    <p className="text-zinc-800 text-[10px] uppercase tracking-widest mt-2 sm:hidden">
      {t.videos.swipeHint}
    </p>
  );
}

// ── Reel Card ─────────────────────────────────────────────────────────────────

function ReelCard({
  clip,
  index,
  categoryTitle,
  onClick,
}: {
  clip: Clip;
  index: number;
  categoryTitle: string;
  onClick: () => void;
}) {
  const hasVideo = !!clip.videoUrl;
  const isYT = clip.videoUrl ? isYouTubeUrl(clip.videoUrl) : false;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex-shrink-0 w-[176px] sm:w-[208px] bg-[#0f0f0f] border border-[#1e1e1e] hover:border-[#e11d48]/50 transition-all duration-200 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e11d48]"
      style={{ aspectRatio: "9/16" }}
      aria-label={`${categoryTitle}: ${clip.title}`}
    >
      {/* Thumbnail */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={clipThumbnail(clip)}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/5" />

      {/* Index */}
      <span className="absolute top-2.5 left-2.5 z-10 text-[10px] font-bold text-white/25 tracking-[0.15em]">
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Badge */}
      {isYT && (
        <span className="absolute top-2.5 right-2.5 z-10 text-[9px] font-bold text-[#e11d48]/70 border border-[#e11d48]/20 px-1.5 py-px uppercase tracking-wider">
          YT
        </span>
      )}
      {!hasVideo && (
        <span className="absolute top-2.5 right-2.5 z-10 text-[9px] font-bold text-zinc-700 border border-[#2a2a2a] px-1.5 py-px uppercase tracking-wider">
          Soon
        </span>
      )}

      {/* Play button */}
      <div className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-white/95 bg-black/55 backdrop-blur-sm shadow-2xl shadow-black/60 group-hover:border-[#e11d48] group-hover:bg-[#e11d48] group-hover:scale-110 flex items-center justify-center transition-all duration-200">
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-0.5"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>

      {/* Title */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5 z-10">
        <p className="font-heading font-bold text-white text-xs sm:text-sm leading-tight uppercase tracking-wide group-hover:text-[#e11d48] transition-colors duration-200 line-clamp-2">
          {clip.title}
        </p>
      </div>
    </button>
  );
}

// ── Reel Row ──────────────────────────────────────────────────────────────────

function ReelRow({
  category,
  onClipClick,
}: {
  category: CategoryWithClips;
  onClipClick: (clipIndex: number) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // Display order matches admin order: top of admin list = leftmost on site
  const displayClips = [...category.clips];

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -180 : 180,
      behavior: "smooth",
    });
  };

  return (
    <div className="mb-14 last:mb-0">
      {/* Row header */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-4 h-px bg-[#e11d48]" />
            <span className="text-zinc-600 text-[10px] font-bold tracking-[0.25em] uppercase">
              {category.label}
            </span>
          </div>
          <h3 className="font-heading font-bold text-white uppercase leading-none text-2xl sm:text-3xl">
            {category.title}
          </h3>
          <p className="text-zinc-500 text-sm mt-1.5 max-w-sm leading-relaxed">
            {category.description}
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 mt-1 shrink-0">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="w-8 h-8 border border-[#1e1e1e] hover:border-zinc-600 text-zinc-700 hover:text-white flex items-center justify-center transition-colors duration-200"
            aria-label={`Scroll ${category.title} left`}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="w-8 h-8 border border-[#1e1e1e] hover:border-zinc-600 text-zinc-700 hover:text-white flex items-center justify-center transition-colors duration-200"
            aria-label={`Scroll ${category.title} right`}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Horizontal scroll strip — free scroll (no snap) so it never gets stuck */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto px-5 sm:px-8 pb-3 scrollbar-hide"
        style={{ touchAction: "pan-x" }}
        role="list"
        aria-label={`${category.title} clips`}
      >
        {displayClips.map((clip, displayIndex) => (
          <div
            key={clip.id}
            role="listitem"
            className="shrink-0"
          >
            <ReelCard
              clip={clip}
              index={displayIndex}
              categoryTitle={category.title}
              onClick={() => onClipClick(displayIndex)}
            />
          </div>
        ))}

        {/* Add-clip placeholder */}
        <div
          className="flex-shrink-0 w-[176px] sm:w-[208px] border border-dashed border-[#1a1a1a] flex flex-col items-center justify-center gap-2"
          style={{ aspectRatio: "9/16" }}
          aria-hidden="true"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="text-zinc-800"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span className="text-zinc-800 text-[9px] uppercase tracking-widest font-semibold">
            Add clip
          </span>
        </div>
      </div>
    </div>
  );
}

// ── More-below indicator ──────────────────────────────────────────────────────
// Floating pill that shows "current row / total" with a bouncing chevron, to
// signal that more reel rows exist below the fold. Hides once the last row
// enters the viewport.

function MoreBelowIndicator({
  rowsRef,
  total,
}: {
  rowsRef: RefObject<(HTMLDivElement | null)[]>;
  total: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const rowEls = rowsRef.current;
    if (!rowEls || rowEls.length === 0) return;

    const ratios = new Array(rowEls.length).fill(0);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const idx = Number((entry.target as HTMLElement).dataset.rowIndex);
          ratios[idx] = entry.intersectionRatio;
        }

        let bestIdx = 0;
        let bestRatio = 0;
        for (let i = 0; i < ratios.length; i++) {
          if (ratios[i] > bestRatio) {
            bestRatio = ratios[i];
            bestIdx = i;
          }
        }

        const anyVisible = ratios.some((r) => r > 0);
        const lastVisible = ratios[ratios.length - 1] > 0;

        setShow(anyVisible && !lastVisible);
        if (bestRatio > 0) setCurrentIndex(bestIdx);
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
    );

    rowEls.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [rowsRef]);

  if (total <= 1) return null;

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 z-30 bottom-24 md:bottom-6 transition-opacity duration-300 pointer-events-none ${
        show ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden={!show}
    >
      <div className="flex items-center gap-2.5 bg-black/70 backdrop-blur-md border border-white/15 rounded-full pl-3.5 pr-3 py-2 shadow-2xl shadow-black/50">
        <span className="text-white/95 text-[10px] font-bold tracking-[0.25em] uppercase tabular-nums">
          {currentIndex + 1} / {total}
        </span>
        <span className="w-px h-3 bg-white/20" />
        <svg
          className="w-3.5 h-3.5 text-[#e11d48] animate-bounce"
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
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────

export default function VideoLibrary() {
  const { t } = useLang();
  const v = t.videos;
  const [clips, setClips] = useState<Clip[]>([]);
  const [modal, setModal] = useState<{
    categoryIndex: number;
    clipIndex: number;
  } | null>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    fetch("/api/clips")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setClips(data);
      })
      .catch(() => {});
  }, []);

  const categoriesWithClips: CategoryWithClips[] = CATEGORIES.map((cat) => {
    const catT = t.categories[cat.id as keyof Translations["categories"]];
    return {
      id: cat.id,
      label: catT.label,
      title: catT.title,
      description: catT.description,
      clips: clips
        .filter((c) => c.category === cat.id)
        .sort((a, b) => a.order - b.order),
    };
  });

  const openClip = useCallback((categoryIndex: number, clipIndex: number) => {
    setModal({ categoryIndex, clipIndex });
  }, []);

  const closeModal = useCallback(() => setModal(null), []);

  const navigate = useCallback((clipIndex: number) => {
    setModal((prev) => (prev ? { ...prev, clipIndex } : null));
  }, []);

  return (
    <>
      <section
        id="videos"
        className="bg-[#080808] py-20 sm:py-28 border-t border-[#111]"
        aria-labelledby="videos-heading"
      >
        {/* Section header */}
        <div className="max-w-6xl mx-auto px-5 sm:px-8 mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-6 h-px bg-[#e11d48]" />
            <span className="text-zinc-500 text-xs font-semibold tracking-[0.25em] uppercase">
              {v.eyebrow}
            </span>
          </div>
          <h2
            id="videos-heading"
            className="font-heading font-black text-white uppercase leading-none mb-4"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
          >
            {v.heading}
          </h2>
          <div className="flex flex-wrap items-center gap-4 sm:gap-8">
            <p className="text-zinc-500 text-base max-w-md leading-relaxed">
              {v.description}
            </p>
            <a
              href="#contact"
              className="flex items-center gap-2 text-[#e11d48] text-xs font-bold uppercase tracking-[0.15em] hover:text-white transition-colors duration-200 shrink-0"
            >
              {v.requestLink}
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>

        <div className="border-t border-[#111] mb-12" />

        {categoriesWithClips.map((category, categoryIndex) => (
          <div
            key={category.id}
            ref={(el) => {
              rowRefs.current[categoryIndex] = el;
            }}
            data-row-index={categoryIndex}
          >
            <ReelRow
              category={category}
              onClipClick={(clipIndex) => openClip(categoryIndex, clipIndex)}
            />
          </div>
        ))}

      </section>

      <MoreBelowIndicator
        rowsRef={rowRefs}
        total={categoriesWithClips.length}
      />

      {modal !== null && (
        <ClipModal
          category={categoriesWithClips[modal.categoryIndex]}
          clipIndex={modal.clipIndex}
          onClose={closeModal}
          onNavigate={navigate}
        />
      )}
    </>
  );
}

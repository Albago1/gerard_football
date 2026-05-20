"use client";

import { useState, useEffect } from "react";
import { upload } from "@vercel/blob/client";
import { logout } from "./actions";

const CATEGORIES = [
  {
    id: "goals",
    label: "Goals",
    prefix: "goal",
    base: ["goal-01", "goal-02", "goal-03", "goal-04"],
  },
  {
    id: "assists",
    label: "Assists",
    prefix: "assist",
    base: ["assist-01", "assist-02", "assist-03"],
  },
  {
    id: "dribbling",
    label: "Dribbling",
    prefix: "dribble",
    base: ["dribble-01", "dribble-02", "dribble-03"],
  },
  {
    id: "movement",
    label: "Runs",
    prefix: "run",
    base: ["run-01", "run-02", "run-03"],
  },
  {
    id: "pressing",
    label: "Pressing",
    prefix: "press",
    base: ["press-01", "press-02", "press-03"],
  },
];

function buildClipList(
  base: string[],
  prefix: string,
  clipMap: ClipMap,
  extra: string[]
): string[] {
  const fromBlob = Object.keys(clipMap).filter((id) =>
    id.startsWith(prefix + "-")
  );
  const all = new Set([...base, ...fromBlob, ...extra]);
  return [...all].sort();
}

function nextClipId(clips: string[], prefix: string): string {
  const nums = clips.map((id) => parseInt(id.match(/-(\d+)$/)?.[1] ?? "0"));
  const next = Math.max(...nums, 0) + 1;
  return `${prefix}-${String(next).padStart(2, "0")}`;
}

type ClipMap = Record<string, { videoUrl?: string; thumbnailUrl?: string }>;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("goals");
  const [clipMap, setClipMap] = useState<ClipMap>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [extraSlots, setExtraSlots] = useState<Record<string, string[]>>({});

  useEffect(() => {
    fetch("/api/clips")
      .then((r) => r.json())
      .then(setClipMap)
      .catch(() => {});
  }, []);

  const category = CATEGORIES.find((c) => c.id === activeTab)!;
  const clips = buildClipList(
    category.base,
    category.prefix,
    clipMap,
    extraSlots[activeTab] ?? []
  );
  const next = nextClipId(clips, category.prefix);

  const handleUpload = async (
    clipId: string,
    videoFile: File | null,
    thumbFile: File | null
  ) => {
    if (!videoFile && !thumbFile) return;
    setUploading(clipId);
    setProgress(0);

    try {
      const updates: { videoUrl?: string; thumbnailUrl?: string } = {};

      if (thumbFile) {
        const ext = thumbFile.name.split(".").pop() ?? "jpg";
        const blob = await upload(
          `thumbnails/${clipId}.${ext}`,
          thumbFile,
          {
            access: "public",
            handleUploadUrl: "/api/admin/upload",
          }
        );
        updates.thumbnailUrl = blob.url;
      }

      if (videoFile) {
        const ext = videoFile.name.split(".").pop() ?? "mp4";
        const blob = await upload(`videos/${clipId}.${ext}`, videoFile, {
          access: "public",
          handleUploadUrl: "/api/admin/upload",
          multipart: true,
          onUploadProgress: ({ percentage }) =>
            setProgress(Math.round(percentage)),
        });
        updates.videoUrl = blob.url;
      }

      setClipMap((prev) => ({
        ...prev,
        [clipId]: { ...prev[clipId], ...updates },
      }));
    } catch (err) {
      alert(`Upload failed: ${(err as Error).message}`);
    } finally {
      setUploading(null);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-4 h-px bg-[#e11d48]" />
            <span className="text-zinc-500 text-xs font-semibold tracking-[0.25em] uppercase">
              Admin
            </span>
          </div>
          <h1 className="font-heading font-black text-white uppercase text-3xl">
            Video Dashboard
          </h1>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="text-zinc-600 hover:text-white text-xs uppercase tracking-widest transition-colors"
          >
            Log out
          </button>
        </form>
      </div>

      {/* Category tabs */}
      <div className="flex border-b border-[#1e1e1e] mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveTab(cat.id)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-widest border-b-2 -mb-px transition-colors ${
              activeTab === cat.id
                ? "border-[#e11d48] text-white"
                : "border-transparent text-zinc-600 hover:text-zinc-400"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Clip rows — newest first */}
      <div className="space-y-2">
        {[...clips].reverse().map((clipId) => (
          <ClipRow
            key={clipId}
            clipId={clipId}
            status={clipMap[clipId]}
            isUploading={uploading === clipId}
            progress={progress}
            onUpload={(v, t) => handleUpload(clipId, v, t)}
          />
        ))}
      </div>

      {/* Add next slot */}
      <button
        type="button"
        onClick={() =>
          setExtraSlots((prev) => ({
            ...prev,
            [activeTab]: [...(prev[activeTab] ?? []), next],
          }))
        }
        className="mt-3 w-full border border-dashed border-[#2a2a2a] hover:border-[#e11d48]/50 text-zinc-700 hover:text-[#e11d48] text-xs font-bold uppercase tracking-widest py-3 transition-colors duration-200"
      >
        + Add {next}
      </button>

      <p className="text-zinc-700 text-xs mt-8 leading-relaxed">
        Files upload directly to Vercel Blob. The site reflects changes
        immediately — no redeploy needed.
      </p>
    </div>
  );
}

// ── Clip row ──────────────────────────────────────────

function ClipRow({
  clipId,
  status,
  isUploading,
  progress,
  onUpload,
}: {
  clipId: string;
  status?: { videoUrl?: string; thumbnailUrl?: string };
  isUploading: boolean;
  progress: number;
  onUpload: (video: File | null, thumb: File | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);

  const hasVideo = !!status?.videoUrl;
  const hasThumb = !!status?.thumbnailUrl;

  return (
    <div className="border border-[#1e1e1e] bg-[#0d0d0d]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="font-heading font-bold text-white uppercase text-sm">
            {clipId}
          </span>
          <Badge ok={hasVideo} label="video" />
          <Badge ok={hasThumb} label="thumb" />
        </div>
        <svg
          className={`w-3.5 h-3.5 text-zinc-700 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-[#1e1e1e] px-4 py-4 space-y-4">
          <FileField
            label="Video (.mov, .mp4, .webm)"
            accept="video/*,.mov"
            onChange={setVideoFile}
            currentUrl={status?.videoUrl}
          />
          <FileField
            label="Thumbnail (.jpg, .png, .webp)"
            accept="image/*"
            onChange={setThumbFile}
            currentUrl={status?.thumbnailUrl}
          />

          {isUploading ? (
            <div className="space-y-1.5">
              <div className="h-1 bg-[#1a1a1a] w-full overflow-hidden">
                <div
                  className="h-1 bg-[#e11d48] transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-zinc-500 text-xs">{progress}% uploading…</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onUpload(videoFile, thumbFile)}
              disabled={!videoFile && !thumbFile}
              className="bg-[#e11d48] hover:bg-[#be123c] disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-bold px-6 py-2.5 uppercase tracking-widest transition-colors"
            >
              Upload
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`text-[10px] font-bold px-1.5 py-px uppercase tracking-wide ${
        ok ? "text-green-400 bg-green-400/10" : "text-zinc-700 bg-[#141414]"
      }`}
    >
      {ok ? "✓" : "✗"} {label}
    </span>
  );
}

function FileField({
  label,
  accept,
  onChange,
  currentUrl,
}: {
  label: string;
  accept: string;
  onChange: (f: File | null) => void;
  currentUrl?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-zinc-500 text-xs uppercase tracking-widest">
          {label}
        </span>
        {currentUrl && (
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#e11d48] text-[10px] uppercase tracking-wide hover:underline"
          >
            View current ↗
          </a>
        )}
      </div>
      <input
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="w-full text-sm text-zinc-500 file:mr-3 file:py-1.5 file:px-3 file:border file:border-[#2a2a2a] file:bg-[#111] file:text-zinc-400 file:text-xs file:uppercase file:tracking-wide hover:file:border-zinc-600 file:cursor-pointer"
      />
    </div>
  );
}

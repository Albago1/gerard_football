"use client";

/*
 * Admin dashboard — manage all video clips.
 *
 * Data is read/written through these API routes (all require admin cookie):
 *   GET    /api/clips             — public list (used here to load)
 *   POST   /api/admin/clips       — create a new clip
 *   PUT    /api/admin/clips       — batch save (reordering)
 *   PUT    /api/admin/clips/[id]  — update a single clip
 *   DELETE /api/admin/clips/[id]  — delete a clip
 *
 * File uploads go directly to Vercel Blob via:
 *   POST   /api/admin/upload      — generates the Blob upload token
 *
 * Required environment variables (set in Vercel dashboard → Settings → Env Vars):
 *   ADMIN_PASSWORD        — protects this page and all admin API routes
 *   BLOB_READ_WRITE_TOKEN — set automatically when you connect Vercel Blob storage
 */

import { useState, useEffect, useMemo } from "react";
import { upload } from "@vercel/blob/client";
import { logout } from "./actions";
import { CATEGORIES } from "@/lib/categories";
import type { Clip } from "@/lib/clips-store";

// ── YouTube ID parser ─────────────────────────────────────────────────────────

function parseYouTubeId(input: string): string | null {
  const trimmed = input.trim();
  const match = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&\s?/]+)/
  );
  if (match) return match[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  return null;
}

// ── Reorder helper ────────────────────────────────────────────────────────────

function reorderClips(clips: Clip[], id: string, dir: "up" | "down"): Clip[] {
  const clip = clips.find((c) => c.id === id);
  if (!clip) return clips;

  const catClips = clips
    .filter((c) => c.category === clip.category)
    .sort((a, b) => a.order - b.order);

  const idx = catClips.findIndex((c) => c.id === id);
  const swapIdx = dir === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= catClips.length) return clips;

  // Swap in category array then renumber 0,1,2…
  [catClips[idx], catClips[swapIdx]] = [catClips[swapIdx], catClips[idx]];
  catClips.forEach((c, i) => {
    c.order = i;
  });

  return clips.map((c) => catClips.find((cc) => cc.id === c.id) ?? c);
}

// ── Form state type ───────────────────────────────────────────────────────────

type FormValues = {
  title: string;
  description: string;
  category: string;
  sourceType: "upload" | "youtube";
  youtubeInput: string;
};

function emptyForm(defaultCategory: string): FormValues {
  return {
    title: "",
    description: "",
    category: defaultCategory,
    sourceType: "upload",
    youtubeInput: "",
  };
}

function clipToForm(clip: Clip): FormValues {
  return {
    title: clip.title,
    description: clip.description,
    category: clip.category,
    sourceType: clip.sourceType,
    youtubeInput: clip.youtubeId ?? "",
  };
}

// ── ClipForm ──────────────────────────────────────────────────────────────────

function ClipForm({
  defaultValues,
  existingClip,
  onSave,
  onCancel,
}: {
  defaultValues: FormValues;
  existingClip?: Clip;
  onSave: (data: Omit<Clip, "id">) => Promise<void>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<FormValues>(defaultValues);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);

  const parsedYoutubeId = useMemo(
    () => parseYouTubeId(values.youtubeInput),
    [values.youtubeInput]
  );

  function set<K extends keyof FormValues>(key: K, val: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!values.title.trim()) {
      alert("Title is required.");
      return;
    }
    if (values.sourceType === "youtube" && !parsedYoutubeId) {
      alert("Enter a valid YouTube URL or 11-character video ID.");
      return;
    }

    setBusy(true);
    try {
      let videoUrl = existingClip?.videoUrl;
      let thumbnailUrl = existingClip?.thumbnailUrl;

      if (videoFile) {
        const ext = videoFile.name.split(".").pop() ?? "mp4";
        const key = `videos/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
        setProgress(5);
        const blob = await upload(key, videoFile, {
          access: "public",
          handleUploadUrl: "/api/admin/upload",
          multipart: true,
          onUploadProgress: ({ percentage }) =>
            setProgress(Math.max(5, Math.round(percentage * 0.9))),
        });
        videoUrl = blob.url;
        setProgress(95);
      }

      if (thumbFile) {
        const ext = thumbFile.name.split(".").pop() ?? "jpg";
        const key = `thumbnails/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
        const blob = await upload(key, thumbFile, {
          access: "public",
          handleUploadUrl: "/api/admin/upload",
        });
        thumbnailUrl = blob.url;
      }

      // Auto-use YouTube thumbnail when no custom thumbnail is provided
      if (values.sourceType === "youtube" && !thumbnailUrl && parsedYoutubeId) {
        thumbnailUrl = `https://img.youtube.com/vi/${parsedYoutubeId}/hqdefault.jpg`;
      }

      await onSave({
        title: values.title.trim(),
        description: values.description.trim(),
        category: values.category,
        order: existingClip?.order ?? 0,
        sourceType: values.sourceType,
        videoUrl: values.sourceType === "upload" ? videoUrl : undefined,
        youtubeId:
          values.sourceType === "youtube"
            ? (parsedYoutubeId ?? undefined)
            : undefined,
        thumbnailUrl,
      });
    } catch (err) {
      alert(`Error: ${(err as Error).message}`);
    } finally {
      setBusy(false);
      setProgress(0);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-5 space-y-4"
    >
      {/* Title */}
      <div>
        <label className="block text-zinc-500 text-[10px] uppercase tracking-widest mb-1.5">
          Title *
        </label>
        <input
          type="text"
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="e.g. Right-foot finish"
          className="w-full bg-[#111] border border-[#222] text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#e11d48] transition-colors"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-zinc-500 text-[10px] uppercase tracking-widest mb-1.5">
          Description
        </label>
        <textarea
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          rows={2}
          placeholder="Short description shown in the viewer…"
          className="w-full bg-[#111] border border-[#222] text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#e11d48] transition-colors resize-none"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-zinc-500 text-[10px] uppercase tracking-widest mb-1.5">
          Category
        </label>
        <select
          value={values.category}
          onChange={(e) => set("category", e.target.value)}
          className="w-full bg-[#111] border border-[#222] text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#e11d48] transition-colors"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.title}
            </option>
          ))}
        </select>
      </div>

      {/* Source type toggle */}
      <div>
        <label className="block text-zinc-500 text-[10px] uppercase tracking-widest mb-2">
          Video Source
        </label>
        <div className="flex gap-2">
          {(["upload", "youtube"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => set("sourceType", type)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-colors ${
                values.sourceType === type
                  ? "border-[#e11d48] text-white bg-[#e11d48]/10"
                  : "border-[#2a2a2a] text-zinc-600 hover:text-zinc-400"
              }`}
            >
              {type === "upload" ? "Upload File" : "YouTube Link"}
            </button>
          ))}
        </div>
      </div>

      {/* YouTube input */}
      {values.sourceType === "youtube" && (
        <div>
          <label className="block text-zinc-500 text-[10px] uppercase tracking-widest mb-1.5">
            YouTube URL or Video ID *
          </label>
          <input
            type="text"
            value={values.youtubeInput}
            onChange={(e) => set("youtubeInput", e.target.value)}
            placeholder="https://youtu.be/VIDEO_ID  or  VIDEO_ID"
            className="w-full bg-[#111] border border-[#222] text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#e11d48] transition-colors font-mono"
          />
          {values.youtubeInput && (
            <p
              className={`mt-1 text-[10px] ${parsedYoutubeId ? "text-green-400" : "text-[#e11d48]"}`}
            >
              {parsedYoutubeId ? `✓ ID: ${parsedYoutubeId}` : "✗ Invalid YouTube URL or ID"}
            </p>
          )}
        </div>
      )}

      {/* Video file upload (upload type only) */}
      {values.sourceType === "upload" && (
        <FileField
          label="Video file (.mov, .mp4, .webm)"
          accept="video/*,.mov"
          currentUrl={existingClip?.videoUrl}
          onChange={setVideoFile}
        />
      )}

      {/* Thumbnail (always) */}
      <FileField
        label={
          values.sourceType === "youtube"
            ? "Custom thumbnail (optional — auto-uses YouTube thumbnail)"
            : "Thumbnail (.jpg, .png, .webp)"
        }
        accept="image/*"
        currentUrl={existingClip?.thumbnailUrl}
        onChange={setThumbFile}
      />

      {/* Progress */}
      {busy && progress > 0 && (
        <div className="space-y-1">
          <div className="h-1 bg-[#1a1a1a] overflow-hidden">
            <div
              className="h-full bg-[#e11d48] transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-zinc-600 text-[10px]">{progress}% uploading…</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={busy}
          className="bg-[#e11d48] hover:bg-[#be123c] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold px-6 py-2.5 uppercase tracking-widest transition-colors"
        >
          {busy ? "Saving…" : "Save Clip"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="text-zinc-600 hover:text-zinc-400 text-xs uppercase tracking-widest transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── FileField ─────────────────────────────────────────────────────────────────

function FileField({
  label,
  accept,
  currentUrl,
  onChange,
}: {
  label: string;
  accept: string;
  currentUrl?: string;
  onChange: (f: File | null) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-zinc-500 text-[10px] uppercase tracking-widest">
          {label}
        </span>
        {currentUrl && (
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#e11d48] text-[10px] uppercase tracking-wide hover:underline"
          >
            Current ↗
          </a>
        )}
      </div>
      <input
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="w-full text-sm text-zinc-500 file:mr-3 file:py-1.5 file:px-3 file:border file:border-[#2a2a2a] file:bg-[#111] file:text-zinc-400 file:text-xs file:uppercase file:tracking-wide hover:file:border-zinc-600 file:cursor-pointer"
      />
      {currentUrl && (
        <p className="text-zinc-700 text-[10px] mt-1 truncate">
          {currentUrl.startsWith("http") ? "Uploaded" : "Local file"}:{" "}
          <span className="font-mono">{currentUrl.split("/").pop()}</span>
        </p>
      )}
    </div>
  );
}

// ── ClipRow ───────────────────────────────────────────────────────────────────

function ClipRow({
  clip,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onMove,
}: {
  clip: Clip;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (dir: "up" | "down") => void;
}) {
  const hasVideo =
    clip.sourceType === "youtube" ? !!clip.youtubeId : !!clip.videoUrl;
  const hasThumb = !!clip.thumbnailUrl;

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border border-[#1e1e1e] bg-[#0d0d0d]">
      {/* Order arrows */}
      <div className="flex flex-col gap-0.5 shrink-0">
        <button
          type="button"
          onClick={() => onMove("up")}
          disabled={isFirst}
          className="text-zinc-700 hover:text-zinc-400 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          aria-label="Move up"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onMove("down")}
          disabled={isLast}
          className="text-zinc-700 hover:text-zinc-400 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          aria-label="Move down"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>

      {/* Title + badges */}
      <div className="flex-1 min-w-0">
        <p className="font-heading font-bold text-white uppercase text-sm leading-tight truncate">
          {clip.title || <span className="text-zinc-600 italic normal-case font-normal">Untitled</span>}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-[9px] font-bold px-1.5 py-px uppercase tracking-wide ${
            clip.sourceType === "youtube"
              ? "text-[#e11d48] bg-[#e11d48]/10"
              : "text-blue-400 bg-blue-400/10"
          }`}>
            {clip.sourceType === "youtube" ? "YouTube" : "Upload"}
          </span>
          <StatusBadge ok={hasVideo} label="video" />
          <StatusBadge ok={hasThumb} label="thumb" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onEdit}
          className="text-zinc-600 hover:text-white text-xs uppercase tracking-widest transition-colors"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="text-zinc-700 hover:text-[#e11d48] transition-colors"
          aria-label="Delete clip"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`text-[9px] font-bold px-1.5 py-px uppercase tracking-wide ${
      ok ? "text-green-400 bg-green-400/10" : "text-zinc-700 bg-[#141414]"
    }`}>
      {ok ? "✓" : "✗"} {label}
    </span>
  );
}

// ── AdminDashboard ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [activeTab, setActiveTab] = useState<string>(CATEGORIES[0].id);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    fetch("/api/clips")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setClips(data);
      })
      .catch(() => {});
  }, []);

  const categoryClips = clips
    .filter((c) => c.category === activeTab)
    .sort((a, b) => a.order - b.order);

  async function handleCreate(data: Omit<Clip, "id">) {
    const maxOrder = categoryClips.length > 0
      ? Math.max(...categoryClips.map((c) => c.order))
      : -1;
    const payload = { ...data, category: data.category, order: maxOrder + 1 };

    const res = await fetch("/api/admin/clips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    const created: Clip = await res.json();
    setClips((prev) => [...prev, created]);
    setIsCreating(false);
  }

  async function handleUpdate(id: string, data: Omit<Clip, "id">) {
    const existing = clips.find((c) => c.id === id)!;
    const updated = { ...existing, ...data };

    const res = await fetch(`/api/admin/clips/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    if (!res.ok) throw new Error(await res.text());
    const result: Clip = await res.json();
    setClips((prev) => prev.map((c) => (c.id === id ? result : c)));
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this clip? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/clips/${id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      alert("Failed to delete clip.");
      return;
    }
    setClips((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleReorder(id: string, dir: "up" | "down") {
    const reordered = reorderClips(clips, id, dir);
    setClips(reordered);
    setReordering(true);
    try {
      await fetch("/api/admin/clips", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reordered),
      });
    } catch {
      // Revert on failure
      setClips(clips);
    } finally {
      setReordering(false);
    }
  }

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
      <div className="flex flex-wrap border-b border-[#1e1e1e] mb-6">
        {CATEGORIES.map((cat) => {
          const count = clips.filter((c) => c.category === cat.id).length;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveTab(cat.id);
                setEditingId(null);
                setIsCreating(false);
              }}
              className={`px-3 py-2.5 text-xs font-bold uppercase tracking-widest border-b-2 -mb-px transition-colors flex items-center gap-1.5 ${
                activeTab === cat.id
                  ? "border-[#e11d48] text-white"
                  : "border-transparent text-zinc-600 hover:text-zinc-400"
              }`}
            >
              {cat.label}
              {count > 0 && (
                <span className="text-[9px] font-bold bg-[#1e1e1e] text-zinc-500 px-1.5 py-0.5 rounded-full">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Create form */}
      {isCreating && (
        <div className="mb-3">
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-2">
            New Clip
          </p>
          <ClipForm
            defaultValues={emptyForm(activeTab)}
            onSave={handleCreate}
            onCancel={() => setIsCreating(false)}
          />
        </div>
      )}

      {/* Add clip button */}
      {!isCreating && (
        <button
          type="button"
          onClick={() => {
            setIsCreating(true);
            setEditingId(null);
          }}
          className="w-full mb-3 border border-dashed border-[#2a2a2a] hover:border-[#e11d48]/50 text-zinc-700 hover:text-[#e11d48] text-xs font-bold uppercase tracking-widest py-3 transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add clip to {CATEGORIES.find((c) => c.id === activeTab)?.title}
        </button>
      )}

      {/* Clip list */}
      <div className="space-y-1.5">
        {categoryClips.length === 0 && !isCreating && (
          <p className="text-zinc-700 text-xs py-6 text-center uppercase tracking-widest">
            No clips yet — add one above.
          </p>
        )}

        {categoryClips.map((clip, i) => (
          <div key={clip.id}>
            {editingId === clip.id ? (
              <div className="mb-1">
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-2">
                  Editing: {clip.title}
                </p>
                <ClipForm
                  defaultValues={clipToForm(clip)}
                  existingClip={clip}
                  onSave={(data) => handleUpdate(clip.id, data)}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            ) : (
              <ClipRow
                clip={clip}
                isFirst={i === 0}
                isLast={i === categoryClips.length - 1}
                onEdit={() => {
                  setEditingId(clip.id);
                  setIsCreating(false);
                }}
                onDelete={() => handleDelete(clip.id)}
                onMove={(dir) => handleReorder(clip.id, dir)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-10 space-y-1.5 text-zinc-700 text-xs leading-relaxed">
        <p>
          {reordering ? "Saving order…" : "Clips are ordered top-to-bottom in each category."}
        </p>
        <p>
          Files upload directly to Vercel Blob — no redeploy needed.
          YouTube clips embed live from YouTube.
        </p>
        <p className="text-zinc-800">
          Env vars needed: <code>ADMIN_PASSWORD</code>, <code>BLOB_READ_WRITE_TOKEN</code>
        </p>
      </div>
    </div>
  );
}

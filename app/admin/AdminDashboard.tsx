"use client";

/*
 * Admin dashboard — manage all video clips.
 *
 * Each clip has: title, category, description, video URL, thumbnail URL, order.
 * Paste any YouTube link (or direct video URL) into the Video URL field.
 *
 * Data API routes (all require the admin session cookie):
 *   GET    /api/clips             — load clips
 *   POST   /api/admin/clips       — create clip
 *   PUT    /api/admin/clips       — batch save (used for reordering)
 *   PUT    /api/admin/clips/[id]  — update single clip
 *   DELETE /api/admin/clips/[id]  — delete clip
 *
 * Required environment variables (Vercel dashboard → Settings → Env Vars):
 *   ADMIN_PASSWORD        — protects this page
 *   BLOB_READ_WRITE_TOKEN — set automatically when Vercel Blob storage is connected
 */

import { useState, useEffect, useRef } from "react";
import { put } from "@vercel/blob/client";
import { logout } from "./actions";
import { CATEGORIES } from "@/lib/categories";
import type { Clip } from "@/lib/clips-store";

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

  [catClips[idx], catClips[swapIdx]] = [catClips[swapIdx], catClips[idx]];
  catClips.forEach((c, i) => {
    c.order = i;
  });

  return clips.map((c) => catClips.find((cc) => cc.id === c.id) ?? c);
}

// ── Form types ────────────────────────────────────────────────────────────────

type FormValues = {
  title: string;
  description: string;
  category: string;
  videoUrl: string;
  thumbnailUrl: string;
};

function emptyForm(defaultCategory: string): FormValues {
  return {
    title: "",
    description: "",
    category: defaultCategory,
    videoUrl: "",
    thumbnailUrl: "",
  };
}

function clipToForm(clip: Clip): FormValues {
  return {
    title: clip.title,
    description: clip.description,
    category: clip.category,
    videoUrl: clip.videoUrl ?? "",
    thumbnailUrl: clip.thumbnailUrl ?? "",
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
  const [busy, setBusy] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const videoFileRef = useRef<HTMLInputElement>(null);
  const thumbFileRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof FormValues>(key: K, val: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function handleFileUpload(
    file: File,
    field: "videoUrl" | "thumbnailUrl",
    setUploading: (v: boolean) => void
  ) {
    setUploading(true);
    try {
      // Step 1: get a short-lived upload token from our server (tiny JSON request)
      const tokenRes = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name }),
      });
      if (!tokenRes.ok) {
        const data = await tokenRes.json();
        throw new Error(data.error ?? "Failed to get upload token");
      }
      const { clientToken } = await tokenRes.json();

      // Step 2: browser PUTs the file straight to Vercel Blob — no size limit
      const blob = await put(file.name, file, {
        access: "public",
        token: clientToken,
      });

      set(field, blob.url);
    } catch (err) {
      alert(`Upload failed: ${(err as Error).message}`);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.title.trim()) {
      alert("Title is required.");
      return;
    }
    setBusy(true);
    try {
      await onSave({
        title: values.title.trim(),
        description: values.description.trim(),
        category: values.category,
        order: existingClip?.order ?? 0,
        videoUrl: values.videoUrl.trim() || undefined,
        thumbnailUrl: values.thumbnailUrl.trim() || undefined,
      });
    } catch (err) {
      alert(`Error: ${(err as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "w-full bg-[#111] border border-[#222] text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#e11d48] transition-colors placeholder:text-zinc-700";

  const isAnyUploading = uploadingVideo || uploadingThumb;

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
          placeholder="e.g. Right-foot finish from range"
          className={inputClass}
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
          className={`${inputClass} resize-none`}
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
          className={inputClass}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.title}
            </option>
          ))}
        </select>
      </div>

      {/* Video */}
      <div>
        <label className="block text-zinc-500 text-[10px] uppercase tracking-widest mb-1.5">
          Video
        </label>
        <input
          type="text"
          value={values.videoUrl}
          onChange={(e) => set("videoUrl", e.target.value)}
          placeholder="https://youtu.be/... or paste any video URL"
          className={inputClass}
        />
        <div className="flex items-center gap-3 mt-2">
          <div className="h-px flex-1 bg-[#1e1e1e]" />
          <span className="text-zinc-700 text-[10px] uppercase tracking-widest shrink-0">
            or upload file
          </span>
          <div className="h-px flex-1 bg-[#1e1e1e]" />
        </div>
        <input
          ref={videoFileRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file, "videoUrl", setUploadingVideo);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => videoFileRef.current?.click()}
          disabled={isAnyUploading}
          className="mt-2 w-full border border-dashed border-[#2a2a2a] hover:border-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-600 hover:text-zinc-300 text-xs uppercase tracking-widest py-2.5 transition-colors flex items-center justify-center gap-2"
        >
          {uploadingVideo ? (
            <>
              <span className="w-3 h-3 border border-zinc-600 border-t-white rounded-full animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              Upload MP4 / MOV / WEBM
            </>
          )}
        </button>
        <p className="text-zinc-700 text-[10px] mt-1">
          YouTube, Vimeo, Google Drive, or upload directly (max 500 MB)
        </p>
      </div>

      {/* Thumbnail */}
      <div>
        <label className="block text-zinc-500 text-[10px] uppercase tracking-widest mb-1.5">
          Thumbnail{" "}
          <span className="normal-case font-normal text-zinc-700">
            (optional)
          </span>
        </label>
        <input
          type="text"
          value={values.thumbnailUrl}
          onChange={(e) => set("thumbnailUrl", e.target.value)}
          placeholder="https://... (leave blank to auto-use YouTube thumbnail)"
          className={inputClass}
        />
        <div className="flex items-center gap-3 mt-2">
          <div className="h-px flex-1 bg-[#1e1e1e]" />
          <span className="text-zinc-700 text-[10px] uppercase tracking-widest shrink-0">
            or upload image
          </span>
          <div className="h-px flex-1 bg-[#1e1e1e]" />
        </div>
        <input
          ref={thumbFileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file, "thumbnailUrl", setUploadingThumb);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => thumbFileRef.current?.click()}
          disabled={isAnyUploading}
          className="mt-2 w-full border border-dashed border-[#2a2a2a] hover:border-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-600 hover:text-zinc-300 text-xs uppercase tracking-widest py-2.5 transition-colors flex items-center justify-center gap-2"
        >
          {uploadingThumb ? (
            <>
              <span className="w-3 h-3 border border-zinc-600 border-t-white rounded-full animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              Upload JPG / PNG / WEBP
            </>
          )}
        </button>
        {values.thumbnailUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={values.thumbnailUrl}
            alt="Thumbnail preview"
            className="mt-2 h-16 w-auto border border-[#1e1e1e] object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={busy || isAnyUploading}
          className="bg-[#e11d48] hover:bg-[#be123c] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold px-6 py-2.5 uppercase tracking-widest transition-colors"
        >
          {busy ? "Saving…" : "Save Clip"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy || isAnyUploading}
          className="text-zinc-600 hover:text-zinc-400 text-xs uppercase tracking-widest transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
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
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
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
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>

      {/* Title + status */}
      <div className="flex-1 min-w-0">
        <p className="font-heading font-bold text-white uppercase text-sm leading-tight truncate">
          {clip.title || (
            <span className="text-zinc-600 italic normal-case font-normal">
              Untitled
            </span>
          )}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Badge ok={!!clip.videoUrl} label="video" />
          <Badge ok={!!clip.thumbnailUrl} label="thumb" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 shrink-0">
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
          <svg
            width="13"
            height="13"
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
      </div>
    </div>
  );
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`text-[9px] font-bold px-1.5 py-px uppercase tracking-wide ${
        ok ? "text-green-400 bg-green-400/10" : "text-zinc-700 bg-[#141414]"
      }`}
    >
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
    const maxOrder =
      categoryClips.length > 0
        ? Math.max(...categoryClips.map((c) => c.order))
        : -1;
    const payload = { ...data, order: maxOrder + 1 };

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
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="flex items-center gap-1.5 text-zinc-600 hover:text-white text-xs uppercase tracking-widest transition-colors"
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
            Main page
          </a>
          <form action={logout}>
            <button
              type="submit"
              className="text-zinc-600 hover:text-white text-xs uppercase tracking-widest transition-colors"
            >
              Log out
            </button>
          </form>
        </div>
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
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
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

        {categoryClips.map((clip, i) =>
          editingId === clip.id ? (
            <div key={clip.id} className="mb-1">
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
              key={clip.id}
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
          )
        )}
      </div>

      {/* Footer */}
      <div className="mt-10 space-y-1 text-zinc-700 text-xs leading-relaxed">
        <p>
          {reordering
            ? "Saving order…"
            : "Clips display newest-first on the public site (highest order = newest)."}
        </p>
        <p>
          Paste any YouTube link into the Video URL field — no special format
          needed.
        </p>
      </div>
    </div>
  );
}

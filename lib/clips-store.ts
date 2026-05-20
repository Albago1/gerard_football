/*
 * Clips data store — single source of truth for all clip metadata.
 *
 * Storage location:
 *   Production (Vercel):  "data/clips.json" in Vercel Blob.
 *   Local development:    data/clips.json on disk (gitignored).
 *
 * Required environment variables:
 *   BLOB_READ_WRITE_TOKEN  — set automatically when you connect Vercel Blob storage
 *                            (Vercel dashboard → Storage → Create → Blob)
 *
 * Video and thumbnail files themselves are stored in Vercel Blob under:
 *   videos/{timestamp}-{random}.{ext}
 *   thumbnails/{timestamp}-{random}.{ext}
 */

import { put, list } from "@vercel/blob";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

export type Clip = {
  id: string;
  title: string;
  description: string;
  category: string;
  order: number;
  // Any URL: YouTube link, Vimeo, Google Drive, or a direct video file URL.
  // The frontend auto-detects the type from the URL and picks the right player.
  videoUrl?: string;
  thumbnailUrl?: string;
};

const BLOB_PATH = "data/clips.json";
const LOCAL_PATH = path.join(process.cwd(), "data", "clips.json");

export async function getClips(): Promise<Clip[]> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { blobs } = await list({ prefix: BLOB_PATH });
      if (blobs.length === 0) return [];
      // Cache-bust so we never read a stale CDN copy
      const res = await fetch(`${blobs[0].url}?t=${Date.now()}`, {
        cache: "no-store",
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  // Local dev fallback
  try {
    const raw = await readFile(LOCAL_PATH, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function saveClips(clips: Clip[]): Promise<void> {
  const body = JSON.stringify(clips, null, 2);

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await put(BLOB_PATH, body, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 0,
    });
    return;
  }

  // Local dev fallback
  await mkdir(path.dirname(LOCAL_PATH), { recursive: true });
  await writeFile(LOCAL_PATH, body, "utf-8");
}

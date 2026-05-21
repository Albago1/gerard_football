import { put, list, get } from "@vercel/blob";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

export type Clip = {
  id: string;
  title: string;
  description: string;
  category: string;
  order: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  /** If true, this clip appears in the Hero Reel on the homepage. */
  featuredInReel?: boolean;
  /** Position within the Hero Reel (lower = earlier). Ignored if not featured. */
  reelOrder?: number;
  /** ISO date string (YYYY-MM-DD) — when the match was played. Displayed under the title. */
  matchDate?: string;
  /** ISO timestamp set when the clip is first created. Used for the "NEW" badge. */
  createdAt?: string;
};

const BLOB_PATH = "data/clips.json";
const LOCAL_PATH = path.join(process.cwd(), "data", "clips.json");

export async function getClips(): Promise<Clip[]> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { blobs } = await list({ prefix: BLOB_PATH });
      if (blobs.length === 0) return [];

      // Use get() so it works with both public and private stores
      const result = await get(blobs[0].url, { access: "private" });
      if (!result || !result.stream) return [];

      const text = await new Response(result.stream).text();
      const data = JSON.parse(text);
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
      access: "private",
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

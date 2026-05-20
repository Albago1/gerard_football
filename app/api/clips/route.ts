import { list } from "@vercel/blob";
import { readdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

async function localFiles(subdir: string): Promise<string[]> {
  try {
    return await readdir(path.join(process.cwd(), "public", subdir));
  } catch {
    return [];
  }
}

export async function GET() {
  const map: Record<string, { videoUrl?: string; thumbnailUrl?: string }> = {};

  // 1. Local files committed to git (public/videos/, public/thumbnails/)
  const [localVideos, localThumbs] = await Promise.all([
    localFiles("videos"),
    localFiles("thumbnails"),
  ]);

  for (const file of localVideos) {
    const id = file.replace(/\.[^.]+$/, "");
    if (id) map[id] = { ...map[id], videoUrl: `/videos/${file}` };
  }

  for (const file of localThumbs) {
    const id = file.replace(/\.[^.]+$/, "");
    if (id) map[id] = { ...map[id], thumbnailUrl: `/thumbnails/${file}` };
  }

  // 2. Vercel Blob uploads — override local if both exist
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const [{ blobs: videos }, { blobs: thumbs }] = await Promise.all([
        list({ prefix: "videos/" }),
        list({ prefix: "thumbnails/" }),
      ]);

      for (const blob of videos) {
        const id = blob.pathname
          .replace(/^videos\//, "")
          .replace(/\.[^.]+$/, "");
        if (id) map[id] = { ...map[id], videoUrl: blob.url };
      }

      for (const blob of thumbs) {
        const id = blob.pathname
          .replace(/^thumbnails\//, "")
          .replace(/\.[^.]+$/, "");
        if (id) map[id] = { ...map[id], thumbnailUrl: blob.url };
      }
    } catch {
      // Blob unavailable — local files still serve as fallback
    }
  }

  return Response.json(map);
}

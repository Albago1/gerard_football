import { list } from "@vercel/blob";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return Response.json({});

  try {
    const [{ blobs: videos }, { blobs: thumbs }] = await Promise.all([
      list({ prefix: "videos/" }),
      list({ prefix: "thumbnails/" }),
    ]);

    const map: Record<string, { videoUrl?: string; thumbnailUrl?: string }> =
      {};

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

    return Response.json(map);
  } catch {
    return Response.json({});
  }
}

import { generateClientTokenFromReadWriteToken } from "@vercel/blob/client";
import { cookies } from "next/headers";

const ALLOWED_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "image/jpeg",
  "image/png",
  "image/webp",
];

// Simple two-step upload flow — no server-to-server callbacks:
//
//   1. Browser POSTs { filename } here → gets a short-lived client token
//   2. Browser PUTs the file DIRECTLY to Vercel Blob using that token
//
// Nothing hangs because there is no completion webhook.

export async function POST(request: Request) {
  const store = await cookies();
  const isAuthed =
    !!process.env.ADMIN_PASSWORD &&
    store.get("admin_token")?.value === process.env.ADMIN_PASSWORD;

  if (!isAuthed) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { filename } = await request.json();

  try {
    const clientToken = await generateClientTokenFromReadWriteToken({
      pathname: filename,
      allowedContentTypes: ALLOWED_TYPES,
      maximumSizeInBytes: 500 * 1024 * 1024, // 500 MB
      addRandomSuffix: true,
      // Give 10 min so large files have time to start uploading
      validUntil: Date.now() + 10 * 60 * 1000,
    });

    return Response.json({ clientToken });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}

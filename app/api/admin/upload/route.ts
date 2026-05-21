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

// Two-phase client upload — both phases are called by the BROWSER:
//
//   Phase 1 "blob.generate-client-token"
//     Browser asks for a signed upload token. We auth-guard this.
//     Returns { clientToken } in the exact shape upload() expects.
//
//   Phase 2 "blob.upload-completed"
//     Browser notifies us after the file lands on Vercel Blob.
//     No auth needed — the upload already happened. Just return {}.
//     We skip handleUpload() here to avoid its internal validation throwing.

export async function POST(request: Request) {
  const body = await request.json() as {
    type?: string;
    payload?: { pathname?: string; callbackUrl?: string };
  };

  // ── Phase 1: generate upload token ────────────────────────────────────────
  if (body.type === "blob.generate-client-token") {
    const store = await cookies();
    const isAuthed =
      !!process.env.ADMIN_PASSWORD &&
      store.get("admin_token")?.value === process.env.ADMIN_PASSWORD;

    if (!isAuthed) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pathname = body.payload?.pathname ?? "upload";

    const clientToken = await generateClientTokenFromReadWriteToken({
      pathname,
      allowedContentTypes: ALLOWED_TYPES,
      maximumSizeInBytes: 500 * 1024 * 1024, // 500 MB
      addRandomSuffix: true,
      // Token valid for 10 min — long enough for large video uploads to start
      validUntil: Date.now() + 10 * 60 * 1000,
    });

    return Response.json({ clientToken });
  }

  // ── Phase 2: upload complete notification ─────────────────────────────────
  if (body.type === "blob.upload-completed") {
    // Nothing to do server-side. upload() will return the blob URL to the browser.
    return Response.json({});
  }

  return Response.json({ error: "Unknown request type" }, { status: 400 });
}

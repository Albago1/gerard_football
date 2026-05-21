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

// upload() from @vercel/blob/client drives two phases:
//
//   Phase 1 "blob.generate-client-token"  — called by the BROWSER
//     We auth-guard this. We generate a signed client token that encodes
//     the callbackUrl — Vercel Blob needs this to know where to POST after
//     the upload lands. Without it the PUT returns 400 (no CORS headers).
//
//   Phase 2 "blob.upload-completed"  — called by VERCEL BLOB SERVERS
//     No browser cookie is sent. We just return {} immediately.

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
    // Use the callbackUrl the browser sends so it's encoded in the token —
    // Vercel Blob validates this field is present before accepting the upload.
    const callbackUrl =
      body.payload?.callbackUrl ??
      `${new URL(request.url).origin}/api/admin/upload`;

    const clientToken = await generateClientTokenFromReadWriteToken({
      pathname,
      allowedContentTypes: ALLOWED_TYPES,
      maximumSizeInBytes: 500 * 1024 * 1024, // 500 MB
      addRandomSuffix: true,
      validUntil: Date.now() + 10 * 60 * 1000, // 10 min
      onUploadCompleted: {
        callbackUrl,
        tokenPayload: "",
      },
    });

    return Response.json({ clientToken });
  }

  // ── Phase 2: upload complete — called by Vercel Blob servers, no cookie ──
  if (body.type === "blob.upload-completed") {
    return Response.json({});
  }

  return Response.json({ error: "Unknown request type" }, { status: 400 });
}

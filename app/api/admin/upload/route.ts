import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { cookies } from "next/headers";

const ALLOWED_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "image/jpeg",
  "image/png",
  "image/webp",
];

// This route handles two phases of a client-side direct upload:
//
//   Phase 1 — "blob.generate-client-token"
//     Called by the browser. We enforce the admin cookie here.
//     Returns a short-lived upload token so the browser can go direct to Blob.
//
//   Phase 2 — "blob.upload-completed"
//     Called server-to-server by Vercel Blob's infrastructure after the file
//     lands. They don't carry a browser cookie, so we must NOT apply the cookie
//     check here — handleUpload authenticates this phase with the blob token.

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  if (body.type === "blob.generate-client-token") {
    const store = await cookies();
    const isAuthed =
      !!process.env.ADMIN_PASSWORD &&
      store.get("admin_token")?.value === process.env.ADMIN_PASSWORD;

    if (!isAuthed) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED_TYPES,
        maximumSizeInBytes: 500 * 1024 * 1024, // 500 MB
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {
        // Nothing extra needed — the client gets blob.url directly.
      },
    });
    return Response.json(jsonResponse);
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 });
  }
}

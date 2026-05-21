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
//   1. Token generation  — browser sends { type: "blob.generate-client-token" }
//   2. Upload completion — browser sends { type: "blob.upload-completed" }
// The browser then uploads the file straight to Vercel Blob (no function body
// size limit), so large video files work fine.

export async function POST(request: Request) {
  const store = await cookies();
  const isAuthed =
    !!process.env.ADMIN_PASSWORD &&
    store.get("admin_token")?.value === process.env.ADMIN_PASSWORD;

  if (!isAuthed) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

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
        // nothing extra needed — caller gets blob.url directly
      },
    });
    return Response.json(jsonResponse);
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 });
  }
}

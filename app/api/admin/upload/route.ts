import { put, createMultipartUpload, uploadPart, completeMultipartUpload } from "@vercel/blob";
import { cookies } from "next/headers";
import { type NextRequest } from "next/server";

// Vercel serverless functions have a 4.5 MB request body limit.
// Images are always small — server-side put() works fine.
// Videos can be large — we split them into 4 MB chunks client-side,
// proxy each chunk through this route, and stitch them on Vercel Blob
// using multipart upload (server → Blob, no CORS issues).

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const ALLOWED_TYPES = [...IMAGE_TYPES, ...VIDEO_TYPES];

async function getAuth() {
  const store = await cookies();
  return (
    !!process.env.ADMIN_PASSWORD &&
    store.get("admin_token")?.value === process.env.ADMIN_PASSWORD
  );
}

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  if (!(await getAuth())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const action = request.nextUrl.searchParams.get("action");

  // ── Image upload (or small file) — single put() ───────────────────────────
  if (!action) {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return Response.json({ error: "No file" }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type))
      return Response.json({ error: "Type not allowed" }, { status: 400 });

    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    });
    return Response.json({ url: blob.url });
  }

  // ── Multipart: init ───────────────────────────────────────────────────────
  if (action === "init") {
    const { filename, contentType } = await request.json();
    if (!VIDEO_TYPES.includes(contentType))
      return Response.json({ error: "Type not allowed" }, { status: 400 });

    const result = await createMultipartUpload(filename, {
      access: "public",
      addRandomSuffix: true,
      contentType,
    });
    return Response.json({ key: result.key, uploadId: result.uploadId });
  }

  // ── Multipart: upload one chunk ───────────────────────────────────────────
  if (action === "part") {
    const key = request.nextUrl.searchParams.get("key")!;
    const uploadId = request.nextUrl.searchParams.get("uploadId")!;
    const partNumber = Number(request.nextUrl.searchParams.get("partNumber") ?? "1");

    const buffer = Buffer.from(await request.arrayBuffer());
    const part = await uploadPart(key, buffer, {
      access: "public",
      key,
      uploadId,
      partNumber,
    });
    return Response.json({ etag: part.etag, partNumber: part.partNumber });
  }

  // ── Multipart: complete ───────────────────────────────────────────────────
  if (action === "complete") {
    const { key, uploadId, parts } = await request.json();
    const blob = await completeMultipartUpload(key, parts, {
      access: "public",
      key,
      uploadId,
    });
    return Response.json({ url: blob.url });
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
}

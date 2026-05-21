import {
  put,
  createMultipartUpload,
  uploadPart,
  completeMultipartUpload,
} from "@vercel/blob";
import { cookies } from "next/headers";
import { type NextRequest } from "next/server";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const ALLOWED_TYPES = [...IMAGE_TYPES, ...VIDEO_TYPES];

async function isAuthed() {
  const store = await cookies();
  return (
    !!process.env.ADMIN_PASSWORD &&
    store.get("admin_token")?.value === process.env.ADMIN_PASSWORD
  );
}

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  if (!(await isAuthed())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const action = request.nextUrl.searchParams.get("action");

  // ── Image upload — simple single put() ───────────────────────────────────
  if (!action) {
    try {
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
    } catch (err) {
      return Response.json({ error: (err as Error).message }, { status: 500 });
    }
  }

  // ── Multipart init ────────────────────────────────────────────────────────
  if (action === "init") {
    try {
      const { filename, contentType } = await request.json();
      if (!VIDEO_TYPES.includes(contentType))
        return Response.json({ error: "Type not allowed" }, { status: 400 });

      const result = await createMultipartUpload(filename, {
        access: "public",
        addRandomSuffix: true,
        contentType,
      });
      // Return filename too so part/complete handlers can use the right pathname
      return Response.json({
        key: result.key,
        uploadId: result.uploadId,
        filename,
      });
    } catch (err) {
      return Response.json({ error: (err as Error).message }, { status: 500 });
    }
  }

  // ── Multipart: upload one chunk ───────────────────────────────────────────
  if (action === "part") {
    try {
      const key        = request.nextUrl.searchParams.get("key")!;
      const uploadId   = request.nextUrl.searchParams.get("uploadId")!;
      const filename   = request.nextUrl.searchParams.get("filename")!;
      const partNumber = Number(request.nextUrl.searchParams.get("partNumber") ?? "1");

      const buffer = Buffer.from(await request.arrayBuffer());
      const part = await uploadPart(filename, buffer, {
        access: "public",
        key,
        uploadId,
        partNumber,
      });
      return Response.json({ etag: part.etag, partNumber: part.partNumber });
    } catch (err) {
      return Response.json({ error: (err as Error).message }, { status: 500 });
    }
  }

  // ── Multipart: complete ───────────────────────────────────────────────────
  if (action === "complete") {
    try {
      const { key, uploadId, filename, parts } = await request.json();
      const blob = await completeMultipartUpload(filename, parts, {
        access: "public",
        key,
        uploadId,
      });
      return Response.json({ url: blob.url });
    } catch (err) {
      return Response.json({ error: (err as Error).message }, { status: 500 });
    }
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
}

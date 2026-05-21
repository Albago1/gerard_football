import { put } from "@vercel/blob";
import { cookies } from "next/headers";

const ALLOWED_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export async function POST(request: Request) {
  const store = await cookies();
  const isAuthed =
    !!process.env.ADMIN_PASSWORD &&
    store.get("admin_token")?.value === process.env.ADMIN_PASSWORD;

  if (!isAuthed) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json({ error: "File type not allowed" }, { status: 400 });
  }

  try {
    // Public blobs are served directly from Vercel's CDN — native range-request
    // support, no proxy hop, works on all mobile browsers out of the box.
    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return Response.json({ url: blob.url });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}

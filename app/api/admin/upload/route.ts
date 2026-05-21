import { put } from "@vercel/blob";
import { cookies } from "next/headers";

// Videos should be added via YouTube / Vimeo URL in the Video URL field.
// This route handles image uploads only (thumbnails, profile pics) —
// images are always well under Vercel's 4.5 MB function body limit.

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function proxyUrl(blobUrl: string) {
  return `/api/media-proxy?url=${encodeURIComponent(blobUrl)}`;
}

export async function POST(request: Request) {
  const store = await cookies();
  const isAuthed =
    !!process.env.ADMIN_PASSWORD &&
    store.get("admin_token")?.value === process.env.ADMIN_PASSWORD;

  if (!isAuthed) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json(
        { error: "Only image files (JPG, PNG, WEBP) can be uploaded. Add videos via YouTube URL." },
        { status: 400 }
      );
    }

    const blob = await put(file.name, file, {
      access: "private",
      addRandomSuffix: true,
    });

    return Response.json({ url: proxyUrl(blob.url) });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}

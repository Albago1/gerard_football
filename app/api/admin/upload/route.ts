import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const store = await cookies();
  const isAuthed =
    store.get("admin_token")?.value === process.env.ADMIN_PASSWORD;

  const body = (await request.json()) as HandleUploadBody;

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        if (!isAuthed) throw new Error("Unauthorized");
        return {
          allowedContentTypes: [
            "video/mp4",
            "video/quicktime",
            "video/webm",
            "image/jpeg",
            "image/png",
            "image/webp",
          ],
          maximumSizeInBytes: 500 * 1024 * 1024,
          addRandomSuffix: false,
          allowOverwrite: true,
        };
      },
      onUploadCompleted: async () => {},
    });

    return Response.json(json);
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}

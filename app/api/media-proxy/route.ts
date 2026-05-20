import { get } from "@vercel/blob";
import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return new Response("Missing url", { status: 400 });
  }

  // Only proxy Vercel Blob URLs — pass everything else through as a redirect
  if (!url.includes(".blob.vercel-storage.com")) {
    return Response.redirect(url, 302);
  }

  try {
    const result = await get(url, { access: "private" });
    if (!result || !result.stream) {
      return new Response("Not found", { status: 404 });
    }

    return new Response(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Failed to fetch", { status: 502 });
  }
}

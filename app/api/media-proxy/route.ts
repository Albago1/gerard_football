import { head } from "@vercel/blob";
import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return new Response("Missing url", { status: 400 });
  }

  // Non-blob URLs: pass through as a redirect
  if (!url.includes(".blob.vercel-storage.com")) {
    return Response.redirect(url, 302);
  }

  try {
    // head() returns metadata + a signed downloadUrl for private blobs
    const blob = await head(url);

    const rangeHeader = request.headers.get("range");

    const fetchHeaders: Record<string, string> = {};
    if (rangeHeader) {
      fetchHeaders["Range"] = rangeHeader;
    }

    // Fetch from the signed download URL, optionally with a byte range
    const upstream = await fetch(blob.downloadUrl, { headers: fetchHeaders });

    const resHeaders: Record<string, string> = {
      "Content-Type": blob.contentType,
      // Tell browsers this resource supports byte-range requests — required for
      // mobile video playback (iOS Safari will refuse to play without this)
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=3600",
    };

    const contentLength = upstream.headers.get("content-length");
    const contentRange = upstream.headers.get("content-range");

    if (contentLength) resHeaders["Content-Length"] = contentLength;
    if (contentRange) resHeaders["Content-Range"] = contentRange;

    // upstream.status will be 206 if a Range header was sent, 200 otherwise
    return new Response(upstream.body, {
      status: upstream.status,
      headers: resHeaders,
    });
  } catch {
    return new Response("Failed to fetch", { status: 502 });
  }
}

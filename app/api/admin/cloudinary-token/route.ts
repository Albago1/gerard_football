import { cookies } from "next/headers";
import crypto from "crypto";

/**
 * Returns a short-lived signed token the browser uses to upload a video
 * directly to Cloudinary (POST to api.cloudinary.com).
 *
 * Required env vars (Vercel dashboard → Settings → Env Vars):
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 */
export async function POST() {
  const store = await cookies();
  const isAuthed =
    !!process.env.ADMIN_PASSWORD &&
    store.get("admin_token")?.value === process.env.ADMIN_PASSWORD;

  if (!isAuthed) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return Response.json(
      {
        error:
          "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, " +
          "CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your Vercel " +
          "environment variables.",
      },
      { status: 503 }
    );
  }

  // Signature covers only the timestamp (simplest valid form).
  // If you add extra upload params (folder, transformation, etc.) they must
  // be included here too, sorted alphabetically, before the secret.
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto
    .createHash("sha256")
    .update(`timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  return Response.json({ signature, timestamp, cloudName, apiKey });
}

/**
 * Insert Cloudinary's automatic quality + format transformations into the URL.
 * `q_auto` picks a smart bitrate (typically 30–50% smaller than the original)
 * and `f_auto` serves WebM/AV1 to browsers that support it. Safe no-op for
 * non-Cloudinary URLs and for URLs that already carry the transformation.
 */
export function optimizeCloudinary(url: string): string {
  if (!url.includes("res.cloudinary.com")) return url;
  if (url.includes("/q_auto")) return url;
  return url.replace("/upload/", "/upload/q_auto,f_auto/");
}

/**
 * Returns the thumbnail URL for a clip. If the clip has no custom thumbnail,
 * falls back to the section default at /public/thumbnails/{category}.jpg.
 */
export function clipThumbnail(clip: {
  thumbnailUrl?: string;
  category: string;
}): string {
  const url = clip.thumbnailUrl?.trim();
  if (url) return optimizeCloudinary(url);
  return `/thumbnails/${clip.category}.jpg`;
}

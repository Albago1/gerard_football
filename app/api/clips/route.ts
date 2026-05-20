import { getClips } from "@/lib/clips-store";

// Never cache — clips change when the admin uploads or edits.
export const dynamic = "force-dynamic";

export async function GET() {
  const clips = await getClips();
  return Response.json(clips);
}

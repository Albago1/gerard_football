import { isAdmin } from "@/lib/admin-auth";
import { getClips, saveClips, type Clip } from "@/lib/clips-store";

// POST /api/admin/clips — create a new clip
export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Omit<Clip, "id">;
  const clips = await getClips();

  const id = `clip-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const newClip: Clip = {
    id,
    ...body,
    createdAt: body.createdAt ?? new Date().toISOString(),
  };

  await saveClips([...clips, newClip]);
  return Response.json(newClip, { status: 201 });
}

// PUT /api/admin/clips — replace the full clip array (used for reordering)
export async function PUT(request: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clips = (await request.json()) as Clip[];
  if (!Array.isArray(clips)) {
    return Response.json({ error: "Expected array" }, { status: 400 });
  }

  await saveClips(clips);
  return Response.json(clips);
}

import { isAdmin } from "@/lib/admin-auth";
import { getClips, saveClips, type Clip } from "@/lib/clips-store";

// PUT /api/admin/clips/[id] — update a single clip's metadata
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as Partial<Clip>;
  const clips = await getClips();

  const idx = clips.findIndex((c) => c.id === id);
  if (idx === -1) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  clips[idx] = { ...clips[idx], ...body, id };
  await saveClips(clips);
  return Response.json(clips[idx]);
}

// DELETE /api/admin/clips/[id] — remove a clip
export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const clips = await getClips();
  const filtered = clips.filter((c) => c.id !== id);

  if (filtered.length === clips.length) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  await saveClips(filtered);
  return new Response(null, { status: 204 });
}

import { kv } from "@vercel/kv";

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);

  /* ─── simple auth guard ─── */
  if (searchParams.get("secret") !== process.env.ADMIN_SECRET)
    return new Response("Forbidden", { status: 403 });

  const id = searchParams.get("id")?.trim();
  if (!id) return new Response("Missing id", { status: 400 });

  /*  guest:<id> is how you store them in kvGuests.ts  */
  const key = `guest:${id}`;

  /* 1️⃣  Does it exist? (optional) */
  const found = await kv.exists(key);
  if (!found) return new Response("Not found", { status: 404 });

  /* 2️⃣  Nuke it */
  await kv.del(key);

  return Response.json({ ok: true, deleted: key });
}

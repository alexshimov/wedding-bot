import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { name } = await req.json();               // { name: "Саша Шимов" }

  /* ---------- quick local rule ---------- */
  const words = name.trim().split(/\s+/);
  return Response.json({ ok: words.length >= 2 });           // need at least 2 words
}

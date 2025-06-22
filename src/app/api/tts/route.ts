import OpenAI from "openai";
import { kv } from "@vercel/kv";

export const runtime = "edge";
const openai = new OpenAI();

export async function POST(req: Request) {
  const text = await req.text();
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)).then(b => Buffer.from(b).toString("hex"));
  const cached = await kv.get<string>(hash);
  if (cached) return Response.json({ url: cached });

  const tts = await openai.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice: "nova",
    input: text,
    format: "mp3"
  });
  const bytes = await tts.body.arrayBuffer();
  const blob = new Blob([bytes], { type: "audio/mpeg" });
  const url = URL.createObjectURL(blob);
  await kv.set(hash, url, { ex: 86400 });
  return Response.json({ url });
}
import OpenAI from "openai";
import type { ChatNode } from "@/lib/flow";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

/* ───────────────────────── helper ── */
function fill(raw: string, ctx: any, userText: string) {
  let txt = raw === "{intro}" && ctx.intro ? ctx.intro : raw;

  if (raw === "{intro}" && !ctx.intro) {
    txt = `Привет, ${ctx.name}!`;
  }

  // simple placeholders
  return txt
    .replace(/<name>/g,  ctx.name ?? "")
    .replace(/<diet>/g,  ctx.diet ?? "")
    .replace(/<stays>/g, ctx.stays ? "остается с ночёвкой" : "")
    .replace(/<input>/g, userText);
}

export async function renderNode(node: ChatNode, ctx: any, userText: string) {
  const raw = Array.isArray(node.template)
    ? node.template[Math.floor(Math.random() * node.template.length)]
    : node.template;
  const compiled = fill(raw, ctx, userText);

  if (node.useGPT === false) {
    if (node.concierge) return [{ role: "bot", text: compiled, type: "concierge", ...node.concierge }];
    
    const out: any[] = [{ role: "bot", type: "text", text: compiled }];
    if (node.info) out.push({ role: "bot", type: "info", ...node.info });
    return out;
  }

  /* GPT as a ‘glue’ layer: forward userText, but keep story prompt locked */
  console.log('system', compiled, 'user', userText)
  const r = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    messages: [
      { role: "system", content: compiled },
      { role: "user", content: userText },
    ],
  });
  
  const out: any[] = [];

  if (node.concierge)  out.push({ role: "bot", text: r.choices[0].message?.content ?? "", type: "concierge", ...node.concierge });
  else out.push({ role: "bot", type: "text", text: r.choices[0].message?.content ?? "" });

  if (node.info) out.push({ role: "bot", type: "info", ...node.info });
  if (node.event) out.push({ role: "bot", type: "event", ...node.event });

  return out;
}

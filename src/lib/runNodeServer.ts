/*
 * Enhanced runFlow():
 *   – keeps a ctx.seen array (topics already covered)
 *   – recognises `__resume__` sentinel to pick the next pending story node
 *   – skips any story node whose tag already appears in ctx.seen
 */
import OpenAI from "openai";
import { FlowEngine } from "@/lib/flowEngine";
import type { ChatNode } from "@/lib/flow";
import { flow } from "@/lib/flow";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function answerUnknown(txt:string){
  const r = await openai.chat.completions.create({
    model:"gpt-3.5-turbo",
    temperature:0.7,
    messages:[
      {role:"system",content:"Ты дружелюбный свадебный бот-консьерж. Извинись и скажи, что информации по данной теме нет."},
      {role:"user",content:txt}
    ],
  });
  return r.choices[0].message?.content ?? "Извините, у меня нет такой информации 🙈";
}

/* ───────────────────────── helper ── */
function fill(raw: string, ctx: any, userText: string) {
  // if the template is literally "{intro}" and ctx.intro exists → use it
  let txt = raw === "{intro}" && ctx.intro ? ctx.intro : raw;

  if (raw === "{intro}" && !ctx.intro) {
    txt = `Привет, ${ctx.name}!`;
  }

  // simple placeholders
  return txt
    .replace(/<name>/g,  ctx.name ?? "")
    .replace(/<diet>/g,  ctx.diet ?? "")
    .replace(/<stays>/g, ctx.stays ? "остается с ночёвкой" : "")
    .replace(/<input>/g, userText);           // if you ever need last answer
}

export async function renderNode(node: ChatNode, ctx: any, userText: string) {
  const raw = Array.isArray(node.template)
    ? node.template[Math.floor(Math.random() * node.template.length)]
    : node.template;
  const compiled = fill(raw, ctx, userText);

  if (node.useGPT === false) {
    const out: any[] = [{ role: "bot", type: "text", text: compiled }];
    if (node.info) out.push({ role: "bot", type: "info", ...node.info });
    return out;
  }

  /* GPT as a ‘glue’ layer: forward userText, but keep story prompt locked */
  const r = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    messages: [
      { role: "system", content: compiled },
      { role: "user", content: userText },
    ],
  });
  return [{ role: "bot", type: "text", text: r.choices[0].message?.content ?? "" }];
}

/**
 * Core runner: single request–response cycle.
 * Handles `ctx.seen` + “resume” sentinel.
 */
export async function runFlow(stateId: string, input: string, ctx: any) {
  // ensure ctx.seen exists
  if (!Array.isArray(ctx.seen)) ctx.seen = [] as string[];
  if (!Array.isArray(ctx.states)) ctx.states = [] as any[];

  /* ── 0. init engine ── */
  const engine = new FlowEngine(stateId);
  let userInput = input.trim();

  /* ── 1. advance immediately if user typed что‑то ── */
  if (userInput) {
    const currentNode = engine.node();
    const expectsButton = currentNode.buttons?.length;
    const expectsFree   = !currentNode.auto && !expectsButton; // узел ждет свободный ввод

    if (expectsButton || expectsFree) {
      engine.advance(userInput, ctx);
      userInput = ""; // consume once
    }

    //if (currentNode.tag) ctx.seen.push(currentNode.tag);
  }

  /* ── 2. build bot messages until остановимся ── */
  const messages: any[] = [];
  for (let guard = 0; guard < 30; guard++) {
    const node = engine.node();
    if (!node) break; // corrupted id

    /* skip duplicate topics */
    if (node.tag && ctx.seen.includes(node.tag)) {
      if (!node.inquiry && node.tag)
        messages.push(...(await renderNode(node, ctx, userInput)));
      engine.advance("", ctx);
      continue;
    }

    /* render */
    messages.push(...(await renderNode(node, ctx, userInput)));
    if (node.delayMs)
      messages.push({ role: "bot", type: "typing", delayMs: node.delayMs });

    /* if node is auto → jump дальше и продолжить цикл */
    if (node.auto) {
      engine.advance("", ctx);
      continue;
    }

    /* interactive node: stop here */
    return {
      state: engine.id(),
      buttons: node.buttons ?? [],
      messages,
    };
  }

  /* ── safety fallback ── */
  return {
    state: engine.id(),
    buttons: [],
    messages,
  };
}
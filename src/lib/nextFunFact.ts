// src/lib/nextFunFact.ts
import { FUN_FACTS } from "./funFacts";

export function nextFunFact(ctx: any): string {
  if (!Array.isArray(ctx.funFactsUsed)) ctx.funFactsUsed = [];

  const unused = FUN_FACTS
    .map((txt, i) => ({ txt, i }))
    .filter(f => !ctx.funFactsUsed.includes(f.i));

  if (unused.length === 0) return "";                // кончились

  const pick = unused[Math.floor(Math.random() * unused.length)];
  ctx.funFactsUsed.push(pick.i);                     // помечаем как использованный
  return pick.txt;
}

/*
 * Core request/response loop, now driven by the BehaviourTree engine.
 * NOTE: nothing else in the repo had to change.
 */
import { FlowEngine } from "@/lib/flowEngine";
import { renderNode } from "./renderNode"
import type { ChatNode } from "./flow";
import { flow } from "./flow";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

/* GPT fallback for totally unknown questions ------------------------ */
export async function answerUnknown(txt: string) {
  const r = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content:
          "Ты дружелюбный свадебный бот-консьерж. Извинись и скажи, что информации по данной теме нет.",
      },
      { role: "user", content: txt },
    ],
  });
  return (
    r.choices[0].message?.content ??
    "Извините, у меня нет такой информации 🙈"
  );
}

/* ------------------------------------------------------------------ */
/* helper: compile template strings exactly as before (unchanged)     */
/* ------------------------------------------------------------------ */
// … the whole fill()/renderNode() block from your original file …
// (copy verbatim – no modifications needed)

export async function runFlow(stateId: string, input: string, ctx: any) {
  /* make sure helper arrays exist */
  if (!Array.isArray(ctx.seen)) ctx.seen = [];
  if (!Array.isArray(ctx.states)) ctx.states = [];

  /* 1️⃣  rebuild engine for the last leaf client told us about */
  ctx.lastUserInput = input.trim();
  const engine = await FlowEngine.resume(stateId, ctx);
  console.log('await FlowEngine.resume(stateId, ctx)', stateId, engine.node().id);

  /* 2️⃣  if guest just sent text – consume it and move on      */

  const userInput = input.trim();
  if (userInput) {
    if (engine.id() === stateId) {
      /* 2a. узел тот же — обычный путь */
      await engine.advance(userInput, ctx);
      console.log('await engine.advance(userInput, ctx);', engine.node().id);
    } else {
      /* 2b. resume перескочил: ввод относится к ПРЕДЫДУЩЕМУ узлу */
      const prevNode = flow[stateId];
      /* если этот узел ожидал ответ — сохраняем его вручную */
      if (prevNode?.inquiry) ctx[prevNode.id] = userInput;
      console.log('switched input prevNode', prevNode.id);
      /* можно дополнительно вызвать собственный обработчик,
         если нужно писать в Google Sheets:
         await prevNode.onExit?.forEach(fn => fn?.(ctx, userInput));
      */
      /* важное: advance НЕ зовём — движок уже стоит на новом валидном листе */
    }
  }

  /* 3️⃣  keep rendering/advancing until we hit an interactive node */
  const messages: any[] = [];
  for (let guard = 0; guard < 3; guard++) {
    const node: ChatNode = engine.node();          // current leaf

    if (node.tag) {
      console.log('ctx.seen.push(node.tag)', node.tag)
      ctx.seen.push(node.tag);
    }

    /* render bubbles (unchanged renderNode helper) */
    messages.push(...(await renderNode(node, ctx, userInput)));

    /* stop if node needs a reply (buttons or free-form inquiry) */
    if (node.buttons?.length || node.inquiry) break;

    /* otherwise auto-advance to next leaf */
    await engine.advance("", ctx);
    console.log('await engine.advance("", ctx);', guard, engine.node().id)
  }

  return {
    state: engine.id(),                // leaf-id for the browser to keep
    buttons: engine.node().buttons ?? [],// quick-reply chips
    messages,                            // payload to append in the chat
  };
}

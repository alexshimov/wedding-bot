import { flow } from "@/lib/flow";
import OpenAI   from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { stateId, userInput, ctx } = await req.json();
  const node = flow[stateId];

  /* имя для подстановки */
  const fullName = ctx.name || [ctx.first, ctx.last].filter(Boolean).join(" ");

  /* ---------- ветка без GPT ---------- */
  if (node.useGPT === false) {
    const ready = node.prompt.replace(/<name>/g, fullName);

    /* отправляем одним куском как text/plain stream */
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(ready));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  /* ---------- ветка с GPT ---------- */
  const prompt = node.prompt.replace(/<name>/g, fullName);

  const completion = await openai.chat.completions.create({
    model:   "gpt-4o",
    stream:  true,
    messages: [
      { role: "system", content: prompt },
      { role: "user",   content: userInput }
    ]
  });

  /* прокидываем SSE-поток как чистый текст */
  const textStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of completion) {
        const part = chunk.choices[0]?.delta?.content;
        if (part) controller.enqueue(new TextEncoder().encode(part));
      }
      controller.close();
    }
  });

  return new Response(textStream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
}

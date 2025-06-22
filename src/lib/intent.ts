import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

/** список известных тегов → id узлов в flow.ts */
export const INTENTS = {
  venue:  "faq_venue",    // где / адрес
  time:   "faq_time",     // во сколько начало
  route:  "faq_route",    // как добраться
  diet:   "ask_diet",     // какая еда
  rsvp:   "rsvp",         // подтвердить участие
  menu:   "menu",         // общее меню
} as const;
export type Intent = keyof typeof INTENTS;

/** GPT: верни одно слово-тег или unknown */
export async function detectIntent(text: string): Promise<Intent | "unknown"> {
  const prompt =
`Ты свадебный бот. Выбери один тег: ${Object.keys(INTENTS).join(", ")}.
Если вопрос не подходит, верни "unknown".
Вопрос: «${text}»
Тег:`;
  const r = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    max_tokens: 1,
    temperature: 0,
    messages: [{ role: "user", content: prompt }],
  });
  const tag = (r.choices[0].message?.content ?? "").trim().toLowerCase();
  return (INTENTS as any)[tag] ? (tag as Intent) : "unknown";
}

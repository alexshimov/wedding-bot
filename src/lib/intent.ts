/* ────────────────────────────────────────────────────────────────
 *  detectIntent.ts
 *  Распознаём «быстрые» вопросы гостей без лишних GPT-запросов.
 *  1) Сначала пробуем локальные RegExp-паттерны (≈ мгновенно, бесплатно)
 *  2) Если не нашли — спрашиваем GPT, но жёстко ограничиваем список тегов
 * ----------------------------------------------------------------
 */

import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

/* ────── интент ⇒ id узла в flow.ts ────── */
export const INTENTS = {
  yes:        "yes",       // «Да»
  no:         "no",        // «Нет»
  continue:   "continue",       // «Поехали», «Дальше»
  dietary_choice:   "dietary_choice",       // мясо, рыба и тп
  dresscode:  "dresscode",  // Какой дресс-код?
  route:      "route",      // Как проехать?
  venue:      "venue",      // Где (адрес)?
  time:       "time",       // Когда начало?
} as const;

export type Intent = keyof typeof INTENTS;

/* ────── локальные ключевые слова для каждого интента ────── */
const INTENT_PATTERNS: Record<Intent, RegExp[]> = {
  yes: [
    /^(да|ага|конечно|соглас[аю]сь|буд[у]|приеду)/i,
  ],
  no: [
    /^(нет|неа|увы|не смогу|к сожалению)/i,
  ],
  continue: [
    /(дальше|продолжить|детали|поехали|go on|окей|ok|готов)/i,
  ],
  dresscode: [
    /(dress.?code|дресс.?код|во.?что|одеться|наряд)/i,
  ],
  route: [
    /(как.*(доехать|добраться|проехать)|дорога|маршрут|транспорт)/i,
  ],
  venue: [
    /(где|адрес|место\s*проведения|локац)/i,
  ],
  time: [
    /(когда|во\s*сколько|начало|тайминг|расписание)/i,
  ],
  dietary_choice: [
    // вегетарианство / веганство
    /(веган|вегетариан(ец|ка|ство)|plant.?based)/i,

    // «без …»
    /(без\s*(мяса|рыбы|глютена|лактозы|молока|орехов|sea\s*food|seafood))/i,

    // прямое указание предпочтения
    /(ем|предпочитаю|люблю).*(только)?\s*(мясо|рыбу|рыбку|птицу|овощи)/i,

    // английские short‑формы
    /(meat|fish|pescatarian|vegan|vegetarian|gluten[- ]?free|lactose[- ]?free)/i,

    // аллергии
    /(аллерги(я|и)\s*на\s*(глютен|орехи|молоко|лактозу|морепродукты|seafood))/i,
  ],
};

/* ────── главный экспорт ────── */
export async function detectIntent(
  input: string,
): Promise<Intent | "unknown"> {

  const text = input.trim().toLowerCase();

  /* 1️⃣  быстрые RegExp-паттерны */
  for (const intent of Object.keys(INTENT_PATTERNS) as Intent[]) {
    if (INTENT_PATTERNS[intent].some(rx => rx.test(text))) {
      return intent;
    }
  }

  /* 2️⃣  GPT-fallback (редко) */
  const prompt = `
Ты — ассистент свадебного бота.  
Верни ТОЛЬКО одно слово-тег из списка: ${Object.keys(INTENTS).join(", ")}  
или "unknown", если фраза не подходит ни под один.

Фраза гостя: «${input}»
Тег:`;

  const r = await openai.chat.completions.create({
    model:        "gpt-3.5-turbo",
    temperature:  0,
    max_tokens:   1,
    messages:     [{ role: "user", content: prompt }],
  });

  const tag = (r.choices[0].message?.content ?? "")
                .trim()
                .toLowerCase() as Intent;

  return tag in INTENTS ? tag : "unknown";
}

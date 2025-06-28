/* src/lib/intent.ts */
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

/* ────── интент ⇒ id узла в flow.ts ────── */
export const INTENTS = {
  /* ответы‑кнопки */
  yes: "yes",
  no: "no",
  continue: "continue",

  /* быстрые вопросы гостей */
  dresscode: "dresscode",      // дресс‑код
  route: "route",          // как добраться
  venue: "venue",          // где / место
  time: "time",           // даты / во‑сколько
  contacts: "contacts",       // с кем связаться
  wish: "wish",           // хочу оставить пожелание
  fun_fact: "fun_fact",       // интересный факт
  gifts: "gifts",          // что дарить
  schedule: "schedule",       // расписание дня
  alcohol: "alcohol",        // правила питья
  dietary_choice: "dietary_choice", // предпочтения в еде
  video: "video_bonus", // предпочтения в еде
} as const;

export type Intent = keyof typeof INTENTS;

/* ────── локальные ключевые слова для каждого интента ────── */
const INTENT_PATTERNS: Record<Intent, RegExp[]> = {
  /* ==== старое — без изменений ==== */
  yes: [/^(да|ага|конечно|соглас[аю]сь|буд[у]|приеду)/i],
  no: [/^(нет|неа|увы|не смогу|к сожалению)/i],
  continue: [/(дальше|продолжить|детали|поехали|go on|окей|ok|готов)/i],

  /* ==== новые / уточнённые ======== */
  venue: [
    /(где|адрес|локац|место\s*проведения|усадьб|village|lifehack)/i,
  ],
  time: [
    /(когда|дата|числ(?:о|а)|во\s*сколько|время|какого|када)/i,
  ],
  route: [
    /(как.*(доехать|добраться|проехать)|дорога|маршрут|транспорт|карта|map)/i,
  ],
  contacts: [
    /(контакт|организатор|кому.*писать|связаться|телефон|звонить|whatsapp|telegram|номер)/i,
  ],
  wish: [
    /(пожелани|поздравлени|поздравить|хочу\s*пожелат|оставить\s*пожел)/i,
  ],
  fun_fact: [
    /(интересн\w*\s+(факт|истор)|забавн\w*\s*факт|fun\s*fact|расскажи.*факт)/i,
  ],
  gifts: [
    /(подар(ок|ки)|что\s*дарить|дар(?:а|ят)|конверт|реквизит|карта|сч[её]т|money|деньг)/i,
  ],
  dresscode: [
    /(dress.?code|дресс.?код|во.?что|одет[ься]|наряд|цвет[ао])/i,
  ],
  schedule: [
    /(расписан|тайминг|программ|schedule|timeline|порядок\s*дня|во\s*сколько.*что)/i,
  ],
  alcohol: [
    /(алкогол|пить|drinks|вино|напитк|спиртн|можно\s*ли\s*алкогол)/i,
  ],
  video: [
    /(видео|тизер|роспис|бонус)/i,
  ],
  dietary_choice: [
    /* существующие правила — оставляем как есть */
    /(веган|вегетариан(ец|ка|ство)|plant.?based)/i,
    /(без\s*(мяса|рыбы|глютена|лактозы|молока|орехов|sea\s*food|seafood))/i,
    /(ем|предпочитаю|люблю).*(только)?\s*(мясо|рыб\w+|птицу|овощи)/i,
    /(meat|fish|pescatarian|vegan|vegetarian|gluten[- ]?free|lactose[- ]?free)/i,
    /(аллерги(я|и)\s*на\s*(глютен|орехи|молоко|лактозу|морепродукты|seafood))/i,
    /(^|\s)(мясо|стейк|гриль|barbeque|meat|🥩|🍗|🍖)(\s|$)/i,
    /(^|\s)(рыб(а|ы|у|ой|е)|fish|морепродукты|seafood|🍣|🐟|🦞|🦐)(\s|$)/i,
    /\b(веган(?:ство)?|вегетариан(?:ец|ка|ство)?|pescatarian)\b/i,
    /\bбез\s+(мяса|рыбы|глютена|лактозы|орехов|сахара)\b/i,
    /^(\s*нет\s*$|\s*без\s*разницы\s*$)/i,
  ],
};

/* ────── главный экспорт ────── */
export async function detectIntent(input: string, allowed: Intent[] = Object.keys(INTENTS) as Intent[]): Promise<Intent | "unknown"> {
  const text = input.trim().toLowerCase();

  var TAGS = Object.keys(INTENTS) as (keyof typeof INTENTS)[];

  if (allowed.length > 0) {
    TAGS = allowed;
  }

  /* 1️⃣  моментальная проверка RegExp */
  // for (const k of TAGS) if (INTENT_PATTERNS[k].some(rx => rx.test(text))) return k;

  console.log(input)

  const intentFn = {
    name: "return_intent",
    description: "Return ONLY one intent tag that matches the guest phrase or Unknown if nothing fits.",
    parameters: {
      type: "object",
      properties: {
        tag: { type: "string", enum: TAGS },
      },
      required: ["tag"],
    },
  };

  /* 2️⃣  GPT‑fallback как КЛАССИФИКАТОР */
  const r = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0125",          // поддерживает function calling
    temperature: 0,
    top_p: 0,
    messages: [
      { role: "system", content: "Ты классификатор, не чат‑бот." },
      //  — F E W  S H O T —
      { role: "user", content: "Во сколько начало?" },
      { role: "assistant", content: JSON.stringify({ tag: "time" }) },
      { role: "user", content: "Какой дресс код?" },
      { role: "assistant", content: JSON.stringify({ tag: "dresscode" }) },
      { role: "user", content: "🐟 Рыба" },
      { role: "assistant", content: JSON.stringify({ tag: "dietary_choice" }) },
      // — WISH —
      { role: "user", content: "Можно оставить пожелание молодым?" },
      { role: "assistant", content: JSON.stringify({ tag: "wish" }) },

      // — FUN FACT —
      { role: "user", content: "Дай какой-нибудь забавный факт о паре" },
      { role: "assistant", content: JSON.stringify({ tag: "fun_fact" }) },

      // — GIFTS —
      { role: "user", content: "Что лучше подарить?" },
      { role: "assistant", content: JSON.stringify({ tag: "gifts" }) },

      // — SCHEDULE —
      { role: "user", content: "Какое расписание на день свадьбы?" },
      { role: "assistant", content: JSON.stringify({ tag: "schedule" }) },

      // — ALCOHOL —
      { role: "user", content: "Алкоголь будет? Можно своё вино?" },
      { role: "assistant", content: JSON.stringify({ tag: "alcohol" }) },

      // — DIETARY CHOICE —
      { role: "user", content: "Я не ем мясо, только рыбу 🐟" },
      { role: "assistant", content: JSON.stringify({ tag: "dietary_choice" }) },
      { role: "user", content: "Без глютена, пожалуйста" },
      { role: "assistant", content: JSON.stringify({ tag: "dietary_choice" }) },
      { role: "user",      content: "Расскажи про политику" },
      { role: "assistant", content: JSON.stringify({ tag: "unknown" }) },
      //  — КОНЕЦ ПРИМЕРОВ —
      { role: "user", content: text },
    ],
    functions: [intentFn],
    function_call: { name: "return_intent" },   // принудительный вызов
  });

  /* 3️⃣  Забираем ответ строго из arguments */
  const call = r.choices[0].message?.function_call;
  if (call?.name === "return_intent" && call.arguments) {
    try {
      const { tag } = JSON.parse(call.arguments);
      return TAGS.includes(tag) ? tag : "unknown";
    } catch { /* fallthrough */ }
  }
  return "unknown";
}

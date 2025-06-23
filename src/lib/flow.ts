/*
 * Revised flow with linear story + interruptible FAQ nodes.
 * Each story node has a `tag` so we can skip it if that topic was already
 * covered in an FAQ answer.  FAQ nodes finish with next="__resume__" –
 * the engine will replace this sentinel with the id of the next pending story
 * node (see runNodeServer.ts).
 */

export interface ChatNode {
  id: string;
  template: string | string[];
  tag?: string;                  // ― thematic tag (venue, schedule…)
  buttons?: string[];
  info?: { title: string; body: string[]; link: string };
  auto?: boolean;
  delayMs?: number;
  inquiry?: boolean;
  concierge?: { img: string; };
  useGPT?: boolean;              // GPT only for natural glue, default = false
  next: string | ((input: string, ctx: any) => string);
}

export const flow: Record<string, ChatNode> = {
  /* ────────────── STORY  ────────────── */
  greeting: {
    id: "greeting",
    template: "{intro}",
    useGPT: false,
    auto: true,
    next: () => "concierge_intro",
  },
  concierge_intro: {
    id:"concierge_intro",
    concierge: {img:"/img/peep-17.svg",},                   // <-- новое поле
    template:"👋 Я свадебный консьерж. Спросим пару деталей!",
    buttons:["Поехали"],
    useGPT: false,
    next: ()=>"venue_1"
  },
  venue_1: {
    id: "venue_1",
    template: "Церемония пройдёт в усадьбе «Середниково» – это историческое место с белыми колоннами и парком.",
    tag: "venue",
    useGPT: false,
    info: {
      title: "🏛 Место церемонии",
      body: ["Усадьба ‘Середниково’, 25 км от Москвы", "Парковка открыта с 12:00"],
      link: "http://localhost"
    },
    buttons: ["Продолжить"],
    next: (inp) => "schedule_1",
  },
  schedule_1: {
    id: "schedule_1",
    template: `Наш день по плану:
14:00 — церемония
17:30 — ужин
20:00 — первый танец и вечеринка`,
    tag: "schedule",
    useGPT: false,
    buttons: ["Продолжить"],
    next: (inp) => "rsvp_ask",
  },
  rsvp_ask: {
    id: "rsvp_ask",
    template: "Смoжете ли вы присоединиться к нам 6 мая?",
    concierge: {img:"/img/peep-18.svg",}, 
    tag: "rsvp",
    useGPT: false,
    inquiry: true,
    buttons: ["Да", "Нет"],
    next: (inp) => inp.length > 0 ? "rsvp_thanks" : "diet_ask",
  },
  rsvp_thanks: {
    id: "rsvp_thanks",
    template: "Спасибо за ответ! 🥂",
    useGPT: false,
    auto: true,
    delayMs: 1000,
    next: () => "diet_ask",
  },
  diet_ask: {
    id: "diet_ask",
    template: "Есть ли у тебя предпочтения в питании?",
    tag: "diet",
    concierge: {img:"/img/peep-19.svg",}, 
    useGPT: false,
    inquiry: true,
    buttons: ["Нет", "Вегетарианская", "Без глютена"],
    next: () => "diet_thanks",
  },
  diet_thanks: {
    id: "diet_thanks",
    template: "Учтём это при подготовке меню!",
    useGPT: false,
    auto: true,
    delayMs: 1000,
    next: () => "fun_fact_offer",
  },
  fun_fact_offer: {
    id: "fun_fact_offer",
    template: "Хочешь услышать забавный факт о нас?",
    tag: "fun_fact",
    useGPT: false,
    buttons: ["Да", "Продолжить"],
    next: (inp) => inp.toLowerCase().startsWith("д") ? "fun_fact" : "closing",
  },
  fun_fact: {
    id: "fun_fact",
    template: "Дима сделал предложение на вершине вулкана Папандоян, пряча кольцо в коробочке с печеньем!",
    useGPT: false,
    auto: true,
    delayMs: 1500,
    next: () => "closing",
  },
  closing: {
    id: "closing",
    template: "До встречи 6 мая! Если понадобится помощь — просто напиши сюда.",
    tag: "closing",
    useGPT: false,
    next: () => "closing",
  },

  /* ────────────── FAQ  ────────────── */
  faq_venue: {
    id: "faq_venue",
    template: "Церемония в усадьбе «Середниково» (25 км от МКАД). При необходимости могу прислать карту!",
    tag: "venue",
    useGPT: false,
    auto: true,
    delayMs: 1200,
    next: () => "__resume__",
  },
  faq_time: {
    id: "faq_time",
    template: "Начинаем ровно в 14:00. Приезжать можно с 13:30 — будет приветственный лимонад.",
    tag: "schedule",
    useGPT: false,
    auto: true,
    delayMs: 1200,
    next: () => "__resume__",
  },
  faq_route: {
    id: "faq_route",
    template: "От Шереметьево лучше всего такси (~35 мин) по платной трассе.",
    tag: "venue",
    useGPT: false,
    auto: true,
    delayMs: 1200,
    next: () => "__resume__",
  },

  unknown: {
    id: "unknown",
    template: `Ты свадебный бот‑консьерж. Гость задаёт вопрос, на который у тебя пока нет информации.
Твоя цель —:
1. Вежливо извиниться, упомянув, что точного ответа нет.
2. Кратко перефразировать суть вопроса гостя (1 предложение).
3. Предложить вернуться к рассказу о предстоящей свадьбе.
Ответь на русском, дружелюбно, одним‑двумя предложениями.`,
    useGPT: true,
    auto: false,              // ← больше не прыгаем автоматически
    buttons: ["Продолжить"],  // ← ждём явного клика
    next: (inp) =>
      inp.toLowerCase().includes("прод") ? "__resume__" : "unknown",
  },
};
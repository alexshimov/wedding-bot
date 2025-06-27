/* ------------------------------------------------------------------ */
/* 1.  Chat-node definition  (unchanged – keeps all the existing UI   */
/*     fields so renderNode.ts keeps working)                         */
/* ------------------------------------------------------------------ */
export interface ChatNode {
  id: string;
  template: string | string[];
  tag?: string;
  buttons?: string[];
  info?: { title: string; body: string[]; link: string };
  event?: { img: string; checkIn: string; checkOut: string, ceremony: string, address: string, mapLink: string, overnight: Boolean };
  auto?: boolean;          // kept for backward-compat but no longer used
  delayMs?: number;
  inquiry?: boolean;
  concierge?: { img: string };
  useGPT?: boolean;
}

import * as prompts from "./prompts";
import { INTENTS } from "@/lib/intent";

/* the original linear map of leaves – **unchanged** ---------------- */
export const flow: Record<string, ChatNode> = {
  /* … all your existing nodes verbatim… */
  greeting: {
    id: "greeting",
    tag: "greeting",
    template: "{intro}",
    useGPT: false,
    auto: true,
  },
  concierge_intro: {
    id: "concierge_intro",
    tag: "concierge_intro",
    concierge: { img: "/img/peep-17.svg", },                   // <-- новое поле
    template: prompts.greeting,
    buttons: ["Поехали"],
    useGPT: true
  },
  eventInfo_overnight: {
    id: "eventInfo_overnight",
    template: prompts.eventInfo_overnight,
    tag: "eventInfo",
    useGPT: true,
    event: {
      img: "/img/village-01.png",
      checkIn: "22 июля, 16:00",
      checkOut: "24 июля, 13:00",
      ceremony: "23 июля, 15:00",
      overnight: true,
      address: "Пушкинский район, поселок городского типа «Зеленоградский», ул.Ватутина 17",
      mapLink: "https://yandex.eu/maps/-/CHg5MRZF",
    },
    buttons: ["Продолжай"]
  },
  eventInfo_ceremony: {
    id: "eventInfo_ceremony",
    template: prompts.eventInfo_ceremony,
    tag: "eventInfo",
    useGPT: true,
    event: {
      img: "/img/village-01.png",
      checkIn: "22 июля, 16:00",
      checkOut: "24 июля, 13:00",
      ceremony: "23 июля, 15:00",
      overnight: false,
      address: "Пушкинский район, поселок городского типа «Зеленоградский», ул.Ватутина 17",
      mapLink: "https://yandex.eu/maps/-/CHg5MRZF",
    },
    buttons: ["Продолжай"]
  },
  schedule_1: {
    id: "schedule_1",
    template: `Наш день по плану:
14:00 — церемония
17:30 — ужин
20:00 — первый танец и вечеринка`,
    tag: "schedule",
    useGPT: false,
    buttons: ["Продолжить 2"]
  },
  rsvp_ask: {
    id: "rsvp_ask",
    template: "Смoжете ли вы присоединиться к нам 6 мая?",
    concierge: { img: "/img/peep-18.svg", },
    tag: "rsvp_ask",
    useGPT: false,
    inquiry: true,
    buttons: ["Да", "Нет"]
  },
  rsvp_yes: {
    id: "rsvp_yes",
    template: "Спасибо за ответ! 🥂",
    useGPT: false
  },
  rsvp_no: {
    id: "rsvp_no",
    template: "Ответ не принимается! Подумайте еще 🥂",
    useGPT: false,
    buttons: ["Да", "Нет"]
  },
  rsvp_other: {
    id: "rsvp_other",
    template: "Скажите мне четко - вы придете?",
    useGPT: false,
    buttons: ["Да", "Нет"]
  },
  diet_ask: {
    id: "diet_ask",
    template: "Есть ли у тебя предпочтения в питании?",
    tag: "diet",
    concierge: { img: "/img/peep-19.svg", },
    useGPT: false,
    inquiry: true,
    buttons: ["Нет", "Вегетарианская", "Без глютена"]
  },
  diet_thanks: {
    id: "diet_thanks",
    template: "Учтём это при подготовке меню!",
    useGPT: false,
    auto: true,
    delayMs: 1000
  },
  fun_fact_offer: {
    id: "fun_fact_offer",
    template: "Хочешь услышать забавный факт о нас?",
    tag: "fun_fact",
    useGPT: false,
    buttons: ["Да", "Продолжить"]
  },
  fun_fact: {
    id: "fun_fact",
    template: "Дима сделал предложение на вершине вулкана Папандоян, пряча кольцо в коробочке с печеньем!",
    useGPT: false,
    auto: true,
    delayMs: 1500
  },
  closing: {
    id: "closing",
    template: "До встречи 6 мая! Если понадобится помощь — просто напиши сюда.",
    tag: "closing",
    useGPT: false
  },

  /* ────────────── FAQ  ────────────── */
  faq_venue: {
    id: "faq_venue",
    template: "Церемония в усадьбе «Середниково» (25 км от МКАД). При необходимости могу прислать карту!",
    tag: "venue",
    useGPT: false,
    auto: true,
    delayMs: 1200
  },
  faq_time: {
    id: "faq_time",
    template: "Начинаем ровно в 14:00. Приезжать можно с 13:30 — будет приветственный лимонад.",
    tag: "faq_time",
    useGPT: false,
    auto: true,
    delayMs: 1200
  },
  faq_route: {
    id: "faq_route",
    template: "От Шереметьево лучше всего такси (~35 мин) по платной трассе.",
    tag: "venue",
    useGPT: false,
    auto: true,
    delayMs: 1200
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
    buttons: ["Продолжить"]
  },
};

/* ------------------------------------------------------------------ */
/* 2.  Behaviour-tree primitives                                      */
/* ------------------------------------------------------------------ */
export type Condition = (ctx: any) => boolean | Promise<boolean>;
export type Action = (ctx: any, lastInput: string) => void | Promise<void>;

export type BTNode =
  | {
    id: string; type: "leaf";
    conditions?: Condition[];
    onEnter?: Action[];
    onExit?: Action[];
  }

  | {
    id: string; type: "sequence" | "selector";
    children: BTNode[];
    conditions?: Condition[];
    onEnter?: Action[];
    onExit?: Action[];
  };

/* handy helpers you may reuse when writing new branches ------------- */
export const once = (tag: string): Condition => (ctx) =>
  !(ctx.seen?.includes?.(tag));

export const isStayingOvernight = (tag: string): Condition => (ctx) =>
  Boolean(ctx.stays);

export const isNotStayingOvernight = (tag: string): Condition => (ctx) =>
  !Boolean(ctx.stays);

export const slotFilled = (slot: string): Condition => (ctx) =>
  Boolean(ctx[slot]);

export const slotNotFilled = (slot: string): Condition => (ctx) =>
  Boolean(!ctx[slot]);

export const intent = (tag: string): Condition => (ctx) => {
  return Boolean(ctx.intent === tag);
}

export const typing = (ms: number): Action => async () =>
  new Promise((r) => setTimeout(r, ms));

/* example async action that stores the answer to Google Sheets ------- */
import { updateGuest } from "./sheets";
export const saveAnswer = (field: string): Action =>
  async (ctx, lastInput) => {
    if (ctx.lastUserInput && ctx.rowNumber) {
      ctx[field] = ctx.lastUserInput;
      await updateGuest(ctx.rowNumber, field, ctx.lastUserInput);
    }
  };

/* ------------------------------------------------------------------ */
/* 3.  Declarative behaviour-tree                                     */
/*     (feel free to extend – only this object needs editing)         */
/* ------------------------------------------------------------------ */
export const tree: BTNode = {
  id: "root",
  type: "sequence",
  children: [
    { id: "greeting", type: "leaf", conditions: [once("greeting")], },
    { id: "concierge_intro", type: "leaf", conditions: [once("concierge_intro")], },
    {
      id: "eventInfo_selector",
      type: "sequence",
      children: [
        {
          id: "eventInfo_overnight",
          type: "leaf",
          conditions: [isStayingOvernight("eventInfo_overnight"), once("eventInfo")]
        },
        {
          id: "eventInfo_ceremony",
          type: "leaf",
          conditions: [isNotStayingOvernight("eventInfo_ceremony"), once("eventInfo")]
        }
      ],
    },
    {
      id: "main",
      type: "sequence",
      children: [
        {
          id: "rsvp_block",
          type: "sequence",
          conditions: [slotNotFilled("rsvp_ask")],
          children: [
            { id: "rsvp_ask", type: "leaf", conditions: [once("rsvp_ask")] },
            {
              id: "rsvp_selector",
              type: "selector",
              children: [
                {
                  id: "rsvp_yes",
                  type: "leaf",
                  conditions: [intent(INTENTS.yes)],
                  onEnter: [saveAnswer('rsvp_ask')]
                },
                {
                  id: "rsvp_no",
                  type: "leaf",
                  conditions: [intent(INTENTS.no)],
                },
                {
                  id: "rsvp_other",
                  type: "leaf",
                  onExit: [],
                },
              ],
            }
          ]
        },
        {
          id: "diet_selector",
          type: "selector",
          children: [
            {
              id: "diet_thanks",
              type: "leaf",
              conditions: [slotFilled("diet_ask")],
            },
            {
              id: "diet_ask",
              type: "leaf",
              onExit: [saveAnswer("diet_ask")],
            },
          ],
        },

        { id: "fun_fact_offer", type: "leaf" },
        {
          id: "fun_fact",
          type: "leaf",
          onEnter: [typing(1500)],
        },
        { id: "closing", type: "leaf" },
      ],
    },
  ],
};

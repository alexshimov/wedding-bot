/* ------------------------------------------------------------------ */
/* 1.  Chat-node definition  (unchanged – keeps all the existing UI   */
/*     fields so renderNode.ts keeps working)                         */
/* ------------------------------------------------------------------ */
export interface ChatNode {
  id: string;
  template: string | string[];
  tag?: string;
  buttons?: string[];
  info?: { title: string; body: string[]; link?: string, img: string };
  event?: { img: string; checkIn: string; checkOut: string, ceremony: string, address: string, mapLink: string, overnight: Boolean };
  auto?: boolean;          // kept for backward-compat but no longer used
  delayMs?: number;
  inquiry?: boolean;
  concierge?: { img: string };
  useGPT?: boolean;
  video?: { id: string, caption: string }
}

import * as prompts from "./prompts";
import { INTENTS } from "@/lib/intent";
import { FACTS_TOTAL } from "./funFacts";   // ← добавьте строку наверху

/* the original linear map of leaves – **unchanged** ---------------- */
export const flow: Record<string, ChatNode> = {
  /* … all your existing nodes verbatim… */
  greeting: {
    id: "greeting",
    tag: "greeting",
    concierge: { img: "/img/bride-groom.png", },
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
  greeting_repeat: {
    id: "greeting_repeat",
    tag: "greeting_repeat",
    concierge: { img: "/img/peep-17.svg", },                   // <-- новое поле
    template: prompts.greeting_repeat,
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
  rsvp_ask: {
    id: "rsvp_ask",
    template: prompts.rsvp_ask,
    concierge: { img: "/img/peep-18.svg", },
    tag: "rsvp_ask",
    useGPT: true,
    buttons: ["✅ Конечно, да", "❌ Нет (лучше не нажимать!)"]
  },
  rsvp_yes: {
    id: "rsvp_yes",
    template: prompts.rsvp_yes,
    useGPT: true,
    buttons: ["👉 Едем дальше!"]
  },
  rsvp_no: {
    id: "rsvp_no",
    template: prompts.rsvp_no,
    useGPT: true,
    buttons: ["✅ Конечно, да"]
  },
  rsvp_other: {
    id: "rsvp_other",
    template: prompts.rsvp_other,
    useGPT: true,
    buttons: ["✅ Конечно, да", "❌ Нет (лучше не нажимать!)"]
  },
  diet_ask: {
    id: "diet_ask",
    template: prompts.diet_ask,
    tag: "diet_ask",
    concierge: { img: "/img/peep-19.svg", },
    useGPT: true,
    buttons: ["🥩 Мясо", "🐟 Рыба"]
  },
  diet_ok: {
    id: "diet_ok",
    template: prompts.diet_ok,
    useGPT: true,
    buttons: ["👉 Отлично, едем дальше!"]
  },
  diet_other: {
    id: "diet_other",
    template: prompts.diet_other,
    useGPT: true,
    buttons: ["🥩 Мясо", "🐟 Рыба"]
  },
  dress_code: {
    id: "dress_code",
    template: prompts.dress_code,
    tag: "dress_code",
    useGPT: false,
    info: {
      img: "/img/dress-code.png",
      title: "Без пестрого пожалуйста!",
      body: [
        "**Цвета:** спокойные, нейтральные или пастельные оттенки.",
        "**Избегаем** ярких принтов, крупных логотипов, джинсов и спортивных кроссовок.",
        "**Мужчинам** — костюм или рубашка + брюки.",
        "**Женщинам** — платье миди/комбинезон."
      ]
    },
    buttons: ["Продолжай"]
  },
  gifts: {
    id: "gifts",
    template: prompts.gifts,
    useGPT: true,
    info: {
      img: "/img/bank-details.png",
      title: "Реквизиты для подарка",
      body: [
        "Если вам удобнее поздравить Олю и Сашу переводом — вот их реквизиты:",
        "🏦 Т-Банк – **+7 963 643 16 82** (Александр Ш.)",
      ]
    },
    buttons: ["👍 Понятно, продолжаем"]
  },
  alcohol: {
    id: "alcohol",
    template: prompts.alcohol,
    useGPT: true,
    buttons: ["👌 Принято, Кузя!"]
  },
  schedule: {
    id: "schedule",
    template: prompts.schedule,
    useGPT: false,
    info: {
      img: "/img/schedule-02.png",
      title: "Расписание дня — 23 июля",
      body: [
        "**13:00** — Сбор гостей, welcome drinks",
        "**14:00** — Церемония с аркой",
        "**14:30** — Поздравления и фотосессия",
        "**15:00** — Фуршет, закуски и общение",
        "**17:00** — Первый танец и сладкий стол",
        "**18:00** — Свободное время, танцы, караоке",
        "**22:00** — Окончание мероприятия"
      ]
    },
    buttons: ["👌 Понятно, едем дальше!"]
  },
  wish: {
    id: "wish",
    template: prompts.wish,
    useGPT: true,
    inquiry: true
  },
  wish_response: {
    id: "wish_response",
    template: prompts.wish_response,
    useGPT: true,
    buttons: ["✨ Продолжить"]
  },
  contacts: {
    id: "contacts",
    template: prompts.contacts,
    useGPT: true,
    buttons: ["✨ Продолжить"],
    info: {
      img: "/img/contacts.png",
      title: "Контакты организатора",
      body: [
        "📍 Организатор: **Анна**",
        "📱 Telegram / WhatsApp: **+7 (963) 508-42-00**",
        "⏰ На связи: до и во время мероприятия",
        "🆘 Любые вопросы, проблемы, помощь"
      ]
    },
  },
  video_bonus: {
    id: "video_bonus",
    template: "А вот и обещанный сюрприз – маленький тизер свадьбы!",
    useGPT: false,
    video: {
      id: "bg8-z9cNk4s",
      caption: "Короткий ролик с места росписи 🌿",
    },
    buttons: ["✨ Продолжить"]
  },
  fun_fact: {
    id: "fun_fact",
    tag: "fun_fact",
    template: prompts.fun_fact,
    useGPT: true,
  },
  fun_fact_random: {
    id: "fun_fact_random",
    template: "{dynamic}",
    tag: "fun_fact_random",
    useGPT: false,
    buttons: ["Ещё факт", "Продолжить"],
  },
  fun_fact_first: {
    id: "fun_fact_first",
    template: "{dynamic}",
    tag: "fun_fact_first",
    useGPT: false,
    buttons: ["Продолжить"],
  },
  fun_fact_empty: {
    id: "fun_fact_empty",
    template: "Похоже, все секреты уже раскрыты! 🎉",
    useGPT: false,
    buttons: ["Продолжить"],
  },
  idle_menu: {
    id: "idle_menu",
    tag: "idle_menu",
    template: prompts.idle,
    useGPT: false,
    buttons: ["Подарки", "Пожелание", "Дресс-код"],
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

export const isIntroNotComplete = (): Condition => (ctx) => {
  return !Boolean(ctx.story_complete);
}

export const isStayingOvernight = (tag: string): Condition => (ctx) =>
  Boolean(ctx.stays);

export const isNotStayingOvernight = (tag: string): Condition => (ctx) =>
  !Boolean(ctx.stays);

export const slotFilled = (slot: string): Condition => (ctx) =>
  Boolean(ctx[slot]);

export const slotNotFilled = (slot: string): Condition => (ctx) => {
  return Boolean(!ctx[slot]);
}

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

export const appendAnswer = (field: string): Action =>
  async (ctx, lastInput) => {
    if (!ctx.lastUserInput?.trim() || !ctx.rowNumber) return;

    /* берём то, что уже было в памяти или в Google Sheet */
    const prev = ctx[field] ?? "";
    const next = prev ? `${prev}\n${ctx.lastUserInput.trim()}` : ctx.lastUserInput.trim();

    ctx[field] = next;                              // обновляем локальный ctx
    await updateGuest(ctx.rowNumber, field, next);  // и саму ячейку
  };

export const pushSlot = (field: string, value: string): Action =>
  async (ctx, lastInput) => {
    ctx[field] = value;
  };

/* ------------------------------------------------------------------ */
/* 3.  Declarative behaviour-tree                                     */
/*     (feel free to extend – only this object needs editing)         */
/* ------------------------------------------------------------------ */
export const tree: BTNode = {
  id: "root",
  type: "selector",
  children: [
    {
      id: "story",
      type: "sequence",
      conditions: [isIntroNotComplete()],
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
              conditions: [slotNotFilled("rsvp")],
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
                      onEnter: [saveAnswer('rsvp_ask'), pushSlot('rsvp', 'complete')]
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
              conditions: [slotNotFilled("diet")],
              children: [
                {
                  id: "diet_ask",
                  type: "leaf",
                  conditions: [once("diet_ask")],
                },
                {
                  id: "diet_ok",
                  type: "leaf",
                  conditions: [intent(INTENTS.dietary_choice)],
                  onEnter: [saveAnswer("diet_ask"), pushSlot('diet', 'complete')]
                },
                {
                  id: "diet_other",
                  type: "leaf"
                },
              ],
            },
            {
              id: "dress_code",
              type: "leaf",
              conditions: [once("dress_code")],
            },
            {
              id: "gifts",
              type: "leaf",
              conditions: [once("gifts")],
            },
            {
              id: "alcohol",
              type: "leaf",
              conditions: [once("alcohol")],
            },
            {
              id: "schedule",
              type: "leaf",
              conditions: [once("schedule")],
            },
            {
              id: "wish_sequence",
              type: "sequence",
              children: [
                {
                  id: "wish",
                  type: "leaf",
                  onEnter: [appendAnswer("wish")],
                  conditions: [once("wish")]
                },
                {
                  id: "wish_response",
                  type: "leaf",
                  conditions: [once("wish_response")]
                },
              ]
            },
            {
              id: "contacts",
              type: "leaf",
              conditions: [once("contacts")]
            },
            {
              id: "video_bonus",
              type: "leaf",
              conditions: [once("video_bonus")]
            },
            {
              id: "fun_fact_selector",
              type: "selector",
              onEnter: [saveAnswer("story_complete")],
              children: [
                {
                  id: "fun_fact_sequence",
                  type: "sequence",
                  conditions: [
                    /* факты ещё есть */
                    (ctx) => (ctx.funFactsUsed?.length ?? 0) < FACTS_TOTAL
                  ],
                  children: [
                    {
                      id: "fun_fact",
                      type: "leaf",
                      conditions: [once("fun_fact")]
                    },
                    {
                      id: "fun_fact_first",
                      type: "leaf",
                    }
                  ]
                },
                { id: "fun_fact_empty", type: "leaf" }
              ]
            },
          ],
        },
      ]
    },
    {
      id: "freeform",
      type: "sequence",
      children: [
        {
          id: "wish_sequence",
          type: "sequence",
          children: [
            {
              id: "wish",
              type: "leaf",
              onEnter: [appendAnswer("wish")]
            },
            {
              id: "wish_response",
              type: "leaf"
            },
          ]
        },
        {
          id: "greeting_repeat",
          type: "leaf",
          conditions: [once("greeting"), once("greeting_repeat")]
        },
        {
          id: "fun_fact_selector",
          type: "selector",
          children: [
            {
              id: "fun_fact_sequence",
              type: "sequence",
              conditions: [
                /* факты ещё есть */
                (ctx) => (ctx.funFactsUsed?.length ?? 0) < FACTS_TOTAL
              ],
              children: [
                {
                  id: "fun_fact",
                  type: "leaf",
                  conditions: [once("fun_fact")]
                },
                {
                  id: "fun_fact_random",
                  type: "leaf",
                }
              ]
            },
            { id: "fun_fact_empty", type: "leaf" }
          ]
        },
        {
          id: "video_bonus",
          type: "leaf"
        },
        {
          id: "contacts",
          type: "leaf"
        },
        {
          id: "wish_sequence",
          type: "sequence",
          children: [
            {
              id: "wish",
              type: "leaf",
              onEnter: [appendAnswer("wish")]
            },
            {
              id: "wish_response",
              type: "leaf"
            },
          ]
        },
        {
          id: "schedule",
          type: "leaf"
        },

        {
          id: "fun_fact_offer",
          type: "leaf"
        }]
    }
  ],
};

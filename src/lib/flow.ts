/* ------------------------------------------------------------------ */
/* 1.  Chat-node definition  (unchanged – keeps all the existing UI   */
/*     fields so renderNode.ts keeps working)                         */
/* ------------------------------------------------------------------ */
import * as prompts from "./prompts";
import { INTENTS, Intent } from "@/lib/intent";
import { FACTS_TOTAL } from "./funFacts";   // ← добавьте строку наверху

export interface ChatNode {
  id: string;
  template: string | string[];
  tag?: string;
  buttons?: string[];
  info?: { title?: string; body?: string[]; link?: string, img?: string };
  event?: { img: string; checkIn: string; checkOut: string, ceremony: string, address: string, mapLink: string, overnight: Boolean };
  auto?: boolean;          // kept for backward-compat but no longer used
  delayMs?: number;
  inquiry?: boolean;
  allowedIntents?: Intent[],
  concierge?: { img: string };
  useGPT?: boolean;
  video?: { id: string, caption: string }
}



/* the original linear map of leaves – **unchanged** ---------------- */
export const flow: Record<string, ChatNode> = {
  /* … all your existing nodes verbatim… */
  greeting: {
    id: "greeting",
    tag: "greeting",
    concierge: { img: "/img/bride-groom.png", },
    template: "{intro}",
    useGPT: false,
    buttons: ["Давай знакомиться!"],
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
  eventInfo: {
    id: "eventInfo",
    template: prompts.eventInfo,
    tag: "eventInfo",
    useGPT: false,
    event: {
      img: "/img/village-01.png",
      checkIn: "22 июля (вт), 17:00",
      checkOut: "24 июля (чт), 12:00",
      ceremony: "23 июля (ср), 16:00",
      overnight: true,
      address: "МО, Пушкинский район, «Зеленоградский», ул.Ватутина 17",
      mapLink: "https://yandex.eu/maps/-/CHg5MRZF",
    },
    buttons: ["Продолжай"]
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
    buttons: ["🌳 Оба дня", "🥂 Только на церемонию", "❌ Нет (лучше не нажимать!)"]
  },
  rsvp_yes: {
    id: "rsvp_yes",
    tag: "rsvp_yes",
    template: prompts.rsvp_yes,
    useGPT: true,
    buttons: ["👉 Едем дальше!"]
  },
  rsvp_yes_only_ceremony: {
    id: "rsvp_yes_only_ceremony",
    tag: "rsvp_yes",
    template: prompts.rsvp_yes_only_ceremony,
    useGPT: true,
    buttons: ["👉 Едем дальше!"]
  },
  rsvp_no: {
    id: "rsvp_no",
    tag: "rsvp_no",
    template: prompts.rsvp_no,
    useGPT: true,
    buttons: ["🌳 Оба дня", "🥂 Только на церемонию"]
  },
  rsvp_other: {
    id: "rsvp_other",
    tag: "rsvp_other",
    template: prompts.rsvp_other,
    useGPT: true,
    buttons: ["🌳 Оба дня", "🥂 Только на церемонию"]
  },
  diet_ask: {
    id: "diet_ask",
    template: prompts.diet_ask,
    tag: "diet_ask",
    concierge: { img: "/img/peep-21.svg", },
    useGPT: true,
    inquiry: true,
    allowedIntents: [INTENTS.dietary_choice],
    buttons: ["Нет, продолжай"]
  },
  diet_ok: {
    id: "diet_ok",
    tag: "diet_ok",
    template: prompts.diet_ok,
    useGPT: true,
    buttons: ["👉 Отлично, едем дальше!"]
  },
  diet_other: {
    id: "diet_other",
    tag: "diet_other",
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
    tag: 'gifts',
    info: {
      img: "/img/bank-details.png",
      title: "Реквизиты для подарка",
      body: [
        "Если вам удобнее поздравить Олю и Сашу переводом — вот их реквизиты:",
        "🏦 Т-Банк – **+7 963 643 16 82** (Александр Ш.)"
      ]
    },
    buttons: ["👍 Понятно, продолжаем"]
  },
  alcohol: {
    id: "alcohol",
    tag: "alcohol",
    template: prompts.alcohol,
    info: {
      img: "/img/alcohol.png",
    },
    useGPT: true,
    buttons: ["👌 Принято, Кузя!"]
  },
  schedule: {
    id: "schedule",
    tag: "schedule",
    template: prompts.schedule,
    useGPT: false,
    info: {
      img: "/img/schedule-02.png",
      title: "Расписание дня — 23 июля",
      body: [
        "**15:00** — Сбор гостей, welcome drinks",
        "**16:00** — Церемония",
        "**16:30** — Поздравления и фотосессия",
        "**17:00** — Ужин и общение",
        "**19:00** — Первый танец и торт",
        "**20:00** — Свободное время, танцы, караоке",
        "**21:00** — Окончание мероприятия"
      ]
    },
    buttons: ["👌 Понятно, едем дальше!"]
  },
  wish: {
    id: "wish",
    tag: "wish",
    template: prompts.wish,
    useGPT: true,
    inquiry: true
  },
  wish_response: {
    id: "wish_response",
    tag: "wish_response",
    template: prompts.wish_response,
    useGPT: true,
    buttons: ["✨ Продолжить"]
  },
  contacts: {
    id: "contacts",
    template: prompts.contacts,
    tag: "contacts",
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
    tag: "video_bonus",
    template: "А вот и обещанный сюрприз... Серьезно думали, что покажу вам образы молодоженов?",
    useGPT: false,
    info: {
      img: "/img/rospis.png",

    },
    // video: {
    //   id: "bg8-z9cNk4s",
    //   caption: "Короткий ролик с места росписи 🌿",
    // },
    buttons: ["✨ Продолжить"]
  },
  flowers: {
    id: "flowers",
    tag: "flowers",
    template: prompts.flowers,
    useGPT: true,
    info: {
      img: "/img/flowers.png",
    },
    // video: {
    //   id: "bg8-z9cNk4s",
    //   caption: "Короткий ролик с места росписи 🌿",
    // },
    buttons: ["👌 Понятно"]
  },
  hints: {
    id: "hints",
    tag: "hints",
    template: prompts.hints,
    useGPT: false,
    info: {
      img: "/img/hints.png",
      title: "Что взять с собой",
      body: [
        "🥿 Сменная удобная обувь",
        "🩴 Тапочки + купальник/плавки",
        "🦟 Средство от комаров",
        "🪥 Мини-набор гигиены",
        "🕶 Солнцезащитные очки и лёгкая панама/шляпа",
        "👕 Лёгкая кофта или плед",
        "🧴 Крем SPF 30+",
        "💊 Личные лекарства",
      ]
    },
    // video: {
    //   id: "bg8-z9cNk4s",
    //   caption: "Короткий ролик с места росписи 🌿",
    // },
    buttons: ["👌 Понятно"]
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
    tag: "fun_fact_empty",
    template: "Похоже, все секреты уже раскрыты! 🎉",
    useGPT: false,
    buttons: ["Продолжить"],
  },
  idle_menu: {
    id: "idle_menu",
    tag: "idle_menu",
    template: prompts.idle,
    useGPT: false,
    buttons: ["Подарки", "Пожелание", "Забавный факт"],
  },
  unknown: {
    id: "unknown",
    tag: "unknown",
    template: prompts.unknown,
    useGPT: false,
    buttons: ["Подарки", "Пожелание", "Дресс-код"],
  },
  transfer: {
    id: "transfer",
    tag: "transfer",
    template: prompts.transfer,
    useGPT: false,
    info: {
      img: "/img/route.png",
      title: "Как добраться до Lifehack Village",
      body: [
        "📍 Адрес: Пушкинский район, **пгт Зеленоградский, ул. Ватутина 17**",
        "🚗 На авто: Ярославское шоссе (М-8) → **Зеленоградский (≈1 ч от Москвы)**",
        "🚕 Такси/каршер: просто введи адрес **«Зеленоградский, Ватутина 17»**",
        "📲 Возникли вопросы? Пиши организатору **Анне**: **+7 (963) 508-42-00)**"
      ]
    },
    buttons: ["Понятно"],
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

export const slotFilled = (slot: string): Condition => (ctx) => {
  //console.log('slotFilled', ctx.id, slot, ctx[slot], Boolean(ctx[slot]))
  return Boolean(ctx[slot]);
}

export const slotNotFilled = (slot: string): Condition => (ctx) => {
  //console.log('slotNotFilled', ctx.id, slot, ctx[slot], Boolean(!ctx[slot]))
  return Boolean(!ctx[slot]);
}

export const intent = (
  first: string,
  ...rest: string[]          // любое число доп. тегов
): Condition => {
  const tags = [first, ...rest];
  return (ctx) => tags.includes(ctx.intent);
};

export const intentWithLast = (
  first: string,
  ...rest: string[]          // любое число доп. тегов
): Condition => {
  const tags = [first, ...rest];
  return (ctx) => (tags.includes(ctx.last_intent) || tags.includes(ctx.intent));
};

export const typing = (ms: number): Action => async () =>
  new Promise((r) => setTimeout(r, ms));

/* example async action that stores the answer to Google Sheets ------- */
import { updateGuest } from "./sheets";
export const saveAnswer = (field: string): Action =>
  async (ctx, lastInput) => {
    if (ctx.lastUserInput && ctx.rowNumber) {
      //console.log('saveAnswer', field, ctx.lastUserInput)
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
    console.log('pushSlot', ctx.id, field, value, ctx[field])
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
        { id: "eventInfo", type: "leaf", conditions: [once("eventInfo")], },
        // {
        //   id: "eventInfo_selector",
        //   type: "sequence",
        //   children: [
        //     {
        //       id: "eventInfo_overnight",
        //       type: "leaf",
        //       conditions: [isStayingOvernight("eventInfo_overnight"), once("eventInfo")]
        //     },
        //     {
        //       id: "eventInfo_ceremony",
        //       type: "leaf",
        //       conditions: [isNotStayingOvernight("eventInfo_ceremony"), once("eventInfo")]
        //     }
        //   ],
        // },
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
                      conditions: [intent(INTENTS.both_days)],
                      onEnter: [saveAnswer('rsvp_ask'), pushSlot('rsvp', 'complete')]
                    },
                    {
                      id: "rsvp_yes_only_ceremony",
                      type: "leaf",
                      conditions: [intent(INTENTS.only_ceremony)],
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
                  onEnter: [saveAnswer("diet_ask"), pushSlot('diet', 'complete')]
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
              id: "flowers",
              type: "leaf",
              conditions: [once("flowers")],
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
                  conditions: [once("wish")]
                },
                {
                  id: "wish_response",
                  type: "leaf",
                  onEnter: [appendAnswer("wish")],
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
            {
              id: "hints",
              type: "leaf",
              conditions: [once("hints")],
              onEnter: [saveAnswer("story_complete")],
            },
          ],
        },
      ]
    },
    {
      id: "freeform",
      type: "sequence",
      conditions: [slotFilled('story_complete')],
      children: [
        {
          id: "greeting_repeat",
          type: "leaf",
          conditions: [once("greeting"), once("greeting_repeat")]
        },
        {
          id: "idle_menu",
          type: "leaf",
          conditions: [once("idle_menu")]
        },
        {
          id: "menu_selector",
          type: "selector",
          children: [
            {
              id: "eventInfo",
              type: "leaf",
              conditions: [intent(INTENTS.venue, INTENTS.time)]
            },
            {
              id: "schedule",
              type: "leaf",
              conditions: [intent(INTENTS.schedule)]
            },
            {
              id: "dress_code",
              type: "leaf",
              conditions: [intent(INTENTS.dresscode)],
            },
            {
              id: "flowers",
              type: "leaf",
              conditions: [intent(INTENTS.flowers)],
            },
            {
              id: "idle_menu",
              type: "leaf",
              conditions: [intent(INTENTS.continue, INTENTS.yes, INTENTS.no)],
            },
            {
              id: "video_bonus",
              type: "leaf",
              conditions: [intent(INTENTS.video)],
            },
            {
              id: "gifts",
              type: "leaf",
              conditions: [intent(INTENTS.gifts)],
            },
            {
              id: "alcohol",
              type: "leaf",
              conditions: [intent(INTENTS.alcohol)],
            },
            {
              id: "hints",
              type: "leaf",
              conditions: [intent(INTENTS.tips)],
            },
            // {
            //   id: "diet_selector",
            //   type: "sequence",
            //   conditions: [intent(INTENTS.dietary_choice)],
            //   children: [
            //     {
            //       id: "diet_ask",
            //       type: "leaf"
            //     },
            //     {
            //       id: "diet_ok",
            //       type: "leaf",
            //       onEnter: [saveAnswer("diet_ask")]
            //     },
            //   ],
            // },
            {
              id: "contacts",
              type: "leaf",
              conditions: [intent(INTENTS.contacts)],
            },
            {
              id: "transfer",
              type: "leaf",
              conditions: [intent(INTENTS.route)],
            },
            {
              id: "wish_sequence",
              type: "sequence",
              conditions: [intentWithLast(INTENTS.wish)],
              children: [
                {
                  id: "wish",
                  type: "leaf"
                },
                {
                  id: "wish_response",
                  type: "leaf",
                  onEnter: [appendAnswer("wish")]
                },
              ]
            },
            {
              id: "fun_fact_selector",
              type: "selector",
              conditions: [intent(INTENTS.fun_fact)],
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
              id: "unknown",
              type: "leaf",
              conditions: [],
            },
          ]
        }
      ]
    }
  ],
};

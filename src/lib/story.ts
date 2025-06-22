// src/lib/story.ts
export interface StoryStep {
  id: string;           // "welcome", "venue", "dresscode", ...
  prompt: string;       // текст бота
  askSlot?: SlotName;   // если этот шаг задаёт вопрос
  requires?: SlotName;  // показывать только если слот ещё НЕ заполнен
}

export const storyScript: StoryStep[] = [
  { id: "welcome",  prompt: "Привет! Я — ваш свадебный консьерж 🤵🏻..." },
  { id: "venue",    prompt: "Церемония пройдёт в старинном замке..." },
  { id: "rsvp",     prompt: "Смогете ли вы прийти?", askSlot: "rsvp" },
  { id: "diet",     prompt: "Есть ли диетические предпочтения?", askSlot: "diet" },
  { id: "funfact",  prompt: "Хотите забавный факт о молодожёнах?", askSlot: "wantFunFact" },
  { id: "ending",   prompt: "Спасибо! Если что — я рядом 👍" },
];

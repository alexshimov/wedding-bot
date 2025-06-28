export interface ChatMsg {
  id: string;
  role: "bot" | "guest";
  type: "text" | "info" | "typing" | "concierge" | "event" | "video";  // ← новое значение
  text?: string;
  title?: string;
  body?: string[];
  img?: string;
  youtubeId?: string;   // «dQw4w9WgXcQ»
  caption?: string;
}

  export interface ChatState {
    id: string;
    prompt: string;          // системный промпт ИЛИ готовый текст
    useGPT?: boolean;        // false => текст отдаём как есть
    buttons?: string[];
    infoCard?: { title: string; body: string[] };
    expects?: "choice";
    next: string | ((inp: string) => string);
  }
  
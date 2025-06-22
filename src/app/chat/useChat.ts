/* src/app/chat/useChat.ts */
import { useState } from "react";
import type { ChatMsg } from "@/lib/types";

/** утилита: гарантировано добавляет id */
function add(m: ChatMsg): ChatMsg {
  return { id: m.id ?? crypto.randomUUID(), ...m };
}

/**
 * Тонкий клиент-хук: хранит messages, кнопки и state,
 * отправляет ввод на /api/step, пока ждёт — показывает индикатор typing
 */
export function useChat(start: string, ctx: { name: string }, guestId: string) {
  const [state,   setState]   = useState(start);
  const [buttons, setButtons] = useState<string[]>([]);
  const [msgs,    setMsgs]    = useState<ChatMsg[]>([]);

  /** отправка текста или клика */
  async function step(input: string) {
    const trimmed = input.trim();
  
    // 0 · guest bubble
    if (trimmed)
      setMsgs((m) => [...m, add({ role:"guest", type:"text", text:trimmed })]);
  
    // 1 · temporary typing bubble
    const typingId = crypto.randomUUID();
    setMsgs((m) => [...m, { id:typingId, role:"bot", type:"typing" }]);
  
    // 2 · server request
    const res = await fetch("/api/step", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: guestId, state, input, ctx }),
    }).then((r) => r.json());
  
    // 3 · remove *all* typing bubbles
    setMsgs((m) => m.filter((msg) => msg.type !== "typing"));
  
    // 4 · update state & buttons
    setState(res.state);
    setButtons(res.buttons ?? []);
  
    // 5 · append bot messages
    setMsgs((m) => {
            const noTyping = m.filter((msg) => msg.type !== "typing");
            const fresh    = res.messages
                               .filter((msg:any) => msg.type !== "typing")
                               .map((msg:any) => add(msg as ChatMsg));
            return [...noTyping, ...fresh];
          });
  }

  return { msgs, buttons, step };
}

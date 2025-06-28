import { useState, useRef, useCallback, useEffect } from "react";
import type { ChatMsg } from "@/lib/types";

const withId = <T extends Partial<ChatMsg>>(m: T): ChatMsg =>
  ({ id: m.id ?? crypto.randomUUID(), ...m }) as ChatMsg;

const TYPING_MS = 900;

export function useChat(start: string, ctx: any, guestId: string) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [buttons, setButtons] = useState<string[]>([]);
  const [state, setState] = useState(start);
  const [busy, setBusy] = useState(false);

  /* очередь живёт во вне-React ref */
  const q = useRef<ChatMsg[]>([]);
  const timer = useRef<NodeJS.Timeout>();

  /* helper: снимаем блокировку,
   когда больше нет тайпинга и очередь пуста */
  const maybeUnlock = useCallback(() => {
    if (q.current.length === 0) setBusy(false);
  }, []);

  /* ---------- показывает typing на TYPING_MS и потом next() ---------- */
  const showTypingThen = useCallback((next: () => void) => {
    setBusy(true);

    setMsgs(m => [...m, withId({ role: "bot", type: "typing" })]);
    timer.current = setTimeout(() => {
      setMsgs(m => m.filter(x => x.type !== "typing"));
      next();
    }, TYPING_MS);
  }, [maybeUnlock]);

  /* ---------- выводит один элемент из очереди ---------- */
  const playNext = useCallback(() => {
    if (q.current.length === 0) return;
    const item = q.current.shift()!;

    setMsgs(m => [...m, item]);

    const botText =
      item.role === "bot" &&
      (item.type === "text" || item.type === "concierge");

    if (botText) {
      /* ждём signal из useTyping (flushNext) */
    } else if (q.current.length) {
      /* info / event — сразу ставим typing-плейсхолдер */
      showTypingThen(playNext);
    } else {
      /* non‑text bubble и это был последний в очереди */
      maybeUnlock();        // <- снимем busy аккуратно
    }
  }, [showTypingThen]);

  /* ---------- when useTyping finishes ---------- */
  const flushNext = useCallback(() => {
    if (q.current.length) showTypingThen(playNext);
    else maybeUnlock();
  }, [playNext, showTypingThen]);

  /* ---------- кладём элементы и, если idle, стартуем ---------- */
  const enqueue = (list: ChatMsg[]) => {
    if (!list.length) return;

    const wasIdle = q.current.length === 0; // очередь была пуста?
    q.current.push(...list);

    if (wasIdle) {
      /* Вместо мгновенного показа первой реплики
         сперва показываем «typing», а потом playNext() */
      showTypingThen(playNext);
    } else if (q.current.length === list.length) playNext(); // очередь была пуста
  };

  /* ---------- основной step() ---------- */
  async function step(input: string) {
    if (busy) return;
    setBusy(true);

    if (input.trim())
      setMsgs(m => [...m, withId({ role: "guest", type: "text", text: input.trim() })]);

    /* временный typing, пока ждём сервер */
    setMsgs(m => [...m, withId({ role: "bot", type: "typing" })]);

    const res = await fetch("/api/step", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: guestId, state, input, ctx }),
    }).then(r => r.json());

    if (res.messages.length === 0) setBusy(false);

    setMsgs(m => m.filter(x => x.type !== "typing"));     // убираем placeholder
    setButtons(res.buttons ?? []);
    setState(res.state);

    enqueue(
      res.messages
        .filter((m: any): m is ChatMsg => m.type !== "typing")
        .map(withId)
    );
  }

  /* ---------- чистим таймер при размонтировании ---------- */
  useEffect(() => () => clearTimeout(timer.current), []);

  return { msgs, buttons, step, flushNext, busy };
}

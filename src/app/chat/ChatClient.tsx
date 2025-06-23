"use client";
import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { MessageList, MessageInput } from "@chatscope/chat-ui-kit-react";

import QuickReplies from "@/components/QuickReplies";
import TextBubble   from "@/components/TextBubble";
import InfoBubble   from "@/components/InfoBubble";
import TypingBubble from "@/components/TypingBubble";
import ConciergeBubble from "@/components/ConciergeBubble";
import { useChat }  from "./useChat";

export default function ChatClient({
  guestName,
  guestId,
  start,
}: {
  guestName: string;
  guestId:  string;
  start:    string;
}) {

  // --- hook ---
  const { msgs, buttons, step } = useChat(start, { name: guestName }, guestId);

  // --- Strict‑mode‑safe kick‑off ---
  const boot = useRef(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (boot.current) return;   // избегаем двойного вызова в Dev‑StrictMode
    boot.current = true;
    step("");                   // auto‑greeting
    // eslint‑disable‑next‑line react-hooks/exhaustive-deps
    
  }, []);

  useEffect(() => {
    if (!bottomRef.current) return;
  
    const last = msgs[msgs.length - 1];
    const behavior = "auto";
  
    bottomRef.current.scrollIntoView({ behavior: "auto" });
  }, [msgs.length]);  
  

  // --- UI ---
  return (
    /* full-height column that contains everything */
    <div className="h-screen-dvh flex flex-col overflow-x-hidden">
      {/* ── sticky header ───────────────────────── */}
      <header className="tg-header fade-up">
  <div className="tg-title">
    <span role="img" aria-label="Ring" className="text-xl">💍</span>
    <span className="whitespace-nowrap ml-2">
      Александр&nbsp;и&nbsp;Ольга&nbsp;·&nbsp;23&nbsp;июля&nbsp;2025
    </span>
  </div>
</header>
  
      {/* ── chat column (scroll area) ───────────── */}
      <main className="flex-1 min-h-0 w-full max-w-md mx-auto flex flex-col px-4">
        <MessageList className="flex-1 min-h-0 overflow-y-auto no-edge-padding">
          {msgs.map((m) => {
            if (m.type === "text")
              return <TextBubble key={m.id} text={m.text} role={m.role} />;
            if (m.type === "info")
              return <InfoBubble key={m.id} card={m} />;
            if (m.type === "typing")
              return <TypingBubble key={m.id} />;
            if (m.type === "concierge")
              return <ConciergeBubble msg={m} />;
            return null;
          })}
          <div ref={bottomRef} />
        </MessageList>

        </main>
        <div className="footer-panel space-y-2 px-4">
        <QuickReplies options={buttons} onPick={step} />
  
        <MessageInput
          placeholder="Ваш ответ…"
          onSend={step}
          attachButton={false}
          className="tg-input"
        />
        </div>
      
    </div>
  );
}
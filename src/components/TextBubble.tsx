"use client";
import { Message } from "@chatscope/chat-ui-kit-react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { useEffect } from "react";

export default function TextBubble({
  text,
  role,
  voice,
}: {
  text: string;
  role: "bot" | "guest";
  voice: boolean;
}) {
  /* ── TTS (не менялся) ── */
  useEffect(() => {
    if (!voice || role !== "bot") return;
    fetch("/api/tts", { method: "POST", body: text })
      .then((r) => r.json())
      .then(({ url }) => new Audio(url).play());
  }, [text, voice, role]);

  /* ── bubble ── */
  return (
    <Message
      model={{
        direction: role === "bot" ? "incoming" : "outgoing",
        position: "single",
      }}
      className="max-w-[80%]"
    >
      <Message.CustomContent>
        {/* контейнер с prose‑классом */}
        <div className="prose prose-sm dark:prose-invert max-w-none markdown">
          <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
            {text}
          </ReactMarkdown>
        </div>
      </Message.CustomContent>
    </Message>
  );
}
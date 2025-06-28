"use client";
import { Message } from "@chatscope/chat-ui-kit-react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTyping } from "@/app/chat/useTyping";

export default function TextBubble({
  text,
  role,
  voice,
  delay = 0,
  onFinishTyping,
}: {
  text: string;
  role: "bot" | "guest";
  voice?: boolean;
  delay?: number;
  onFinishTyping?: () => void;
}) {
    /* ────────── typing effect ────────── */
  const shown = role === "bot"
    ? useTyping(text, 20, onFinishTyping)   // 3-й аргумент — колбэк
    : text;
  /* ────────── auto-scroll while typing ────────── */
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "auto" });
  }, [shown]);

  return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, x: -200 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 0.35, ease: "backOut", delay }}
        ref={ref}
      >
        <Message
          model={{
            direction: role === "bot" ? "incoming" : "outgoing",
            position: "single",
          }}
          className="max-w-[80%]"
        >
          <Message.CustomContent>
            <div className="prose prose-sm dark:prose-invert max-w-none markdown">
              <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                {shown}
              </ReactMarkdown>
            </div>
          </Message.CustomContent>
        </Message>
      </motion.div>
    );
}
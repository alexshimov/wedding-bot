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
}: {
  text: string;
  role: "bot" | "guest";
  voice?: boolean;
  delay?: number;
}) {
    /* ────────── typing effect ────────── */
  const shown = role === "bot" ? useTyping(text) : text;

  /* ────────── auto-scroll while typing ────────── */
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "auto" });
  }, [shown]);

  return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut", delay }}
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
"use client";
import Image from "next/image";
import { Message } from "@chatscope/chat-ui-kit-react";
import { ChatMsg } from "@/lib/types";
import { motion } from "framer-motion";
import { useTyping } from "@/app/chat/useTyping";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

export default function ConciergeBubble({ msg, onFinishTyping, }: { msg: ChatMsg, onFinishTyping?: () => void; }) {
  /* ────────── typing effect ────────── */
  const shown = useTyping(msg.text, 10, onFinishTyping);
  /* ────────── auto-scroll while typing ────────── */
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "auto" });
  }, [shown]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, x: -200 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ duration: 0.35, ease: "backOut", delay: 0 }}
      ref={ref}
    >
      <Message model={{ direction: "incoming", position: "single" }}
        className="max-w-[90%]">
        <Message.CustomContent>
          <div className="concierge-card portraitcard">
            {msg.img && (
              <Image src={msg.img} alt="" width={320} height={320}
                className="concierge-img" placeholder="empty" />
            )}

            <div className="concierge-text"><ReactMarkdown rehypePlugins={[rehypeSanitize]}>{shown}</ReactMarkdown></div>
          </div>
        </Message.CustomContent>
      </Message>
    </motion.div>
  );
}

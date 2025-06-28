"use client";
import { Message } from "@chatscope/chat-ui-kit-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ChatMsg } from "@/lib/types";
import { useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

/**
 * Информационная карточка, отображаемая прямо внутри стандартного «пузыря».
 * Убираем собственную белую подложку, чтобы контент выглядел как обычное сообщение.
 */
export default function InfoBubble({ card }: { card: Extract<ChatMsg, { type: "info" }> }) {

  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => { ref.current?.scrollIntoView({ behavior: "auto" }); }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, x: -200 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ duration: .35, ease: "easeOut" }}
      ref={ref}
    >
    <Message
      model={{ direction: "incoming", position: "single" }}
      className="max-w-[80%]"
    >
      <Message.CustomContent>
        <div className="info-card">
          {card.img && (
            <Image
              src={card.img}
              alt=""
              width={400}
              height={200}
              className="w-full rounded-lg mb-2 object-cover"
            />
          )}
          {card.title && <h3 className="info-head">{card.title}</h3>}
          {card.body?.map((line, i) => (
            <div key={i}><ReactMarkdown rehypePlugins={[rehypeSanitize]}>{line}</ReactMarkdown></div>
          ))}
          {card.link && (
            <a
              href={card.link}
              target="_blank"
              className="text-blue-600 underline inline-block mt-1"
            >
              {card.link_name} →
            </a>
          )}
        </div>
      </Message.CustomContent>
    </Message>
    </motion.div>
  );
}
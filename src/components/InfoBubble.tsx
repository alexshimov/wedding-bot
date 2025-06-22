"use client";
import { Message } from "@chatscope/chat-ui-kit-react";
import Image from "next/image";
import { ChatMsg } from "@/lib/types";

/**
 * Информационная карточка, отображаемая прямо внутри стандартного «пузыря».
 * Убираем собственную белую подложку, чтобы контент выглядел как обычное сообщение.
 */
export default function InfoBubble({ card }: { card: Extract<ChatMsg, { type: "info" }> }) {
  return (
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
            <p key={i}>{line}</p>
          ))}
          {card.link && (
            <a
              href={card.link}
              target="_blank"
              className="text-blue-600 underline inline-block mt-1"
            >
              Подробнее →
            </a>
          )}
        </div>
      </Message.CustomContent>
    </Message>
  );
}
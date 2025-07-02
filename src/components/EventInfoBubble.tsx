"use client";
import { Message } from "@chatscope/chat-ui-kit-react";
import Image from "next/image";
import { ChatMsg } from "@/lib/types";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

/**
 * Информационная карточка, отображаемая прямо внутри стандартного «пузыря».
 * Убираем собственную белую подложку, чтобы контент выглядел как обычное сообщение.
 */
export default function InfoBubble({ card }: { card: Extract<ChatMsg, { type: "info" }> }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "auto" });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, x: -200 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ duration: 0.45, ease: "backOut", delay: 0.35 }}
      ref={ref}
    >
      <Message
        model={{ direction: "incoming", position: "single" }}
        className="max-w-[80%]"
      >
        <Message.CustomContent>
          <div className="info-card">
            {/* картинка-обложка */}
            <Image
              src={card.img}
              alt=""
              width={400}
              height={180}
              className="w-full h-44 object-cover rounded-lg mb-3"
              priority
            />

            {/* блок дат */}
            <div className="mb-2 text-sm font-medium">
              <div className="mt-1 text-lg font-large event-head">LIFEHACK VILLAGE</div>
              {card.overnight && (<div className="mt-1">🛏 Заезд:  <strong>{card.checkIn}</strong></div>)}
              <div className="mt-1">💍 Церемония: <strong>{card.ceremony}</strong></div>
              {card.overnight && (<div className="mt-1">🚗 Выезд: <strong>{card.checkOut}</strong></div>)} 
            </div>

            {/* адрес */}
            <p className="text-sm">{card.address}</p>

            {/* ссылка «Как добраться» */}
            <a
              href={card.mapLink}
              target="_blank"
              className="mt-1 inline-block text-blue-600 underline"
            >
              Как добраться →
            </a>
          </div>
        </Message.CustomContent>
      </Message>
    </motion.div>
  );
}
"use client";
import { Message } from "@chatscope/chat-ui-kit-react";
import { motion } from "framer-motion";
import InfoList from "./InfoList";   
import { ChatMsg } from "@/lib/types";
import { useRef, useEffect } from "react";
import NextImage from "next/image";


/**
 * Информационная карточка, отображаемая прямо внутри стандартного «пузыря».
 * Убираем собственную белую подложку, чтобы контент выглядел как обычное сообщение.
 */
export default function InfoBubble({ card }: { card: Extract<ChatMsg, { type: "info" }> }) {

  const ref = useRef<HTMLDivElement | null>(null);

  /* ————— единый помощник: докручиваем нижнюю грань элемента ———— */
  const scrollSelf = () =>
    ref.current?.scrollIntoView({ block: "end", behavior: "auto" });

  /* 1️⃣  первый рендер + любые изменения размеров внутри карточки  */
  useEffect(() => {
    scrollSelf(); // сразу после монтирования

    const el = ref.current;
    if (!el) return;

    const ro = new ResizeObserver(scrollSelf); // отслеживаем изменение высоты
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, x: -200 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ duration: .35, ease: "easeOut" }}
      ref={ref}
    >
    <Message
      model={{ direction: "incoming", position: "single" }}
      className="max-w-[100%]"
    >
      <Message.CustomContent>
        <div className="info-card">
          {card.img && (
            <NextImage
              src={card.img}
              alt=""
              width={400}
              height={200}
              className="w-full rounded-lg mb-2 object-cover"
              onLoadingComplete={scrollSelf}
            />
          )}
          {card.title && <h3 className="info-head">{card.title}</h3>}
          {card.body && <InfoList lines={card.body} />}
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
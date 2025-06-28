/* components/VideoBubble.tsx */
"use client";
import { Message } from "@chatscope/chat-ui-kit-react";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

export default function VideoBubble({
  id, youtubeId, caption,
}: { id:string; youtubeId:string; caption?:string }) {

  const [ready, setReady] = useState(false);
  const ref = useRef<HTMLDivElement|null>(null);
  useEffect(() => ref.current?.scrollIntoView({ block:"end", behavior:"auto" }), [ready]);

  return (
    <motion.div /* === анимация появления === */
      key={id}
      initial={{ opacity:0, scale:.95, x:-200 }}
      animate={{ opacity:1, scale:1,   x:0   }}
      transition={{ duration:.35, ease:"backOut" }}
      ref={ref}
    >
      <Message model={{ direction:"incoming", position:"single" }}
               className="w-full max-w-none p-0">
        <Message.CustomContent>

          {/* ───── Видео-кадр ───── */}
          <div className="tg-video">
            {/* постер → исчезнет после onLoad */}
            {!ready && (
              <Image
                src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                alt=""
                fill
                className="object-cover transition-opacity duration-300"
              />
            )}

            <iframe
              className={`w-full h-full absolute inset-0
                          ${ready ? "opacity-100" : "opacity-0"}`}
              src={`https://www.youtube.com/embed/${youtubeId}?rel=0&autoplay=1&mute=1&playsinline=1`}
              title="YouTube video"
              allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setReady(true)}
            />
          </div>
        </Message.CustomContent>
      </Message>
    </motion.div>
  );
}

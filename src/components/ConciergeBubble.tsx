"use client";
import Image from "next/image";
import { Message } from "@chatscope/chat-ui-kit-react";
import { ChatMsg } from "@/lib/types";

export default function ConciergeBubble({ msg }: { msg: ChatMsg }) {
  return (
    <Message model={{ direction:"incoming", position:"single" }}
             className="max-w-[90%]">
      <Message.CustomContent>
        <div className="concierge-card portraitcard">
          {msg.img && (
            <Image src={msg.img} alt="" width={320} height={320}
            className="concierge-img"  placeholder="empty"/>
          )}

<p className="concierge-text">{msg.text}</p>
        </div>
      </Message.CustomContent>
    </Message>
  );
}

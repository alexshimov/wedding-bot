
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import "./globals.css";
import type { ReactNode } from "react";
import { Manrope } from "next/font/google";
const titleFont = Manrope({ weight:"700", subsets:["latin","cyrillic"], variable:"--font-title" });

export const metadata = { title: "Приглашение на свадьбу", description: "Александр и Ольга - 23 Июля 2025" };


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={titleFont.variable}>
      <body>
        {children}
      </body>
    </html>
  );
}
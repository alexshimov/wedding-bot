
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import "./globals.css";
import type { ReactNode } from "react";
import { Manrope } from "next/font/google";
const titleFont = Manrope({ weight:"700", subsets:["latin","cyrillic"], variable:"--font-title" });

export const metadata = { title: "Wedding Invitation", description: "Anna & Dmitri" };


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={titleFont.variable}>
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
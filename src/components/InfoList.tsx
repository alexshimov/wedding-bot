"use client";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

interface Props {
  lines: string[];
}

export default function InfoList({ lines }: Props) {
  return (
    <ul className="tg-list">
      {lines.map((raw, i) => {
        /*  ⌚️  13:00 — ...   или   18:00–22:00 — ...   */
        const m = raw.match(
          /^\s*([0-9]{1,2}[:.][0-9]{2}(?:\s*[–—-]\s*[0-9]{1,2}[:.][0-9]{2})?)\s*[—-]\s*(.*)$/u
        );

        /* ── пункт-расписание ─────────────────────── */
        if (m) {
          const [, time, text] = m;
          return (
            <li key={i} className="schedule">
              <span className="time">{time}</span>
              <span className="text">
                <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                  {text}
                </ReactMarkdown>
              </span>
            </li>
          );
        }

        /* ── обычный bullet-пункт ─────────────────── */
        return (
          <li key={i} className="plain">
            <span className="text">
              <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                {raw}
              </ReactMarkdown>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

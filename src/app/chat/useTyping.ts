import { useEffect, useState } from "react";

/** Returns the gradually-revealed text. */
export function useTyping(full: string, speedMs = 5, onDone?: () => void) {
  const [shown, setShown] = useState<string>("");

  useEffect(() => {
    // instantly show guest bubbles / second renders
    if (!full || shown === full) return;

    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(full.slice(0, i));
      if (i === full.length) {
        clearInterval(id);
        onDone?.(); 
      }
    }, speedMs);

    return () => clearInterval(id);
  }, [full]);          // ← restart when text changes

  return shown; // while mounting: fallback to full
}

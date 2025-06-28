"use client";
export default function QuickReplies({
  options,
  onPick,
  disabled = false,
}: {
  options: string[];
  onPick: (value: string) => void;
  disabled?: boolean;
}) {
  if (!options?.length) return null;

  return (
    <div className="flex gap-2 flex-wrap -mt-1 mb-2">
      {options.map((opt) => (
        <button
          key={opt}
          disabled={disabled}
          onClick={() => onPick(opt)}
          className={
            "quick-chip " +
            (disabled ? "opacity-40 cursor-default pointer-events-none" : "")
          }
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

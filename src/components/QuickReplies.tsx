"use client";
export default function QuickReplies({
  options,
  onPick,
}: {
  options: string[];
  onPick: (value: string) => void;
}) {
  if (!options?.length) return null;

  return (
    <div className="flex gap-2 flex-wrap -mt-1 mb-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onPick(opt)}
          className="quick-chip"
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

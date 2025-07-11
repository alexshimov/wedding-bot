// NO "use client" here – this stays a server component
import ChatClient from "./ChatClient";

export default function ChatPage({
  searchParams,
}: {
  searchParams: { guest?: string; id?: string };
}) {
  const rawName  = (searchParams.guest ?? "Гость Гостьев").replace(/\+/g, " ");
  const guestId  = searchParams.id ?? "";
  const start    = "greeting";            // your old constant

  return (
    <ChatClient
      guestName={rawName}
      guestId={guestId}
      start={start}
    />
  );
}
// NO "use client" here – this stays a server component
import ChatPage from "./page";

export default function ChatPageServer({
  searchParams,
}: {
  searchParams: { guest?: string; id?: string };
}) {
  const rawName  = (searchParams.guest ?? "Гость Гостьев").replace(/\+/g, " ");
  const guestId  = searchParams.id ?? "";
  const start    = "greeting";            // your old constant

  return (
    <ChatPage
      guestName={rawName}
      guestId={guestId}
      start={start}
    />
  );
}
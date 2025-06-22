export const runtime = "edge";
export async function POST(req: Request) {
  // TODO: integrate with Google Sheets
  const data = await req.json();
  console.log("RSVP", data);
  return new Response("ok");
}
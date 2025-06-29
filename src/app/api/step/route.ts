// src/app/api/step/route.ts
import { loadGuests } from "@/lib/sheets";
import { runFlow, answerUnknown } from "@/lib/runNodeServer";
import { detectIntent, INTENTS } from "@/lib/intent";
import { flow } from "@/lib/flow";
import { updateGuest } from "@/lib/sheets";
import { getGuest, saveGuest }   from "@/lib/kvGuests";

//let cache: Record<string, any> | null = null;

//console.log("PEM header in prod:", (process.env.GSA_PRIVATE_KEY ?? "").slice(0, 60));

export async function POST(req: Request) {
  const body = await req.json();                           // { id?, state, input }
  const guestId = body.id;     
  const sid = body.sid;                            // id from query string
  const guest = await getGuest(guestId, sid);
  

  // console.log(body)
  // if (!cache) {
  //   const list = await loadGuests();
  //   cache = Object.fromEntries(list.map((g) => [g.id, g]));
  // }

  // const guest = cache[guestId];

  if (!guest) {
    return Response.json({
      state: "not_invited",
      buttons: [],
      messages: [
        {
          role: "bot", type: "text",
          text: "Извините, ваш идентификатор не найден в списке гостей 😔"
        },
      ],
    });
  }

  // const isFirstHit = body.state === "greeting" && (body.input ?? "").trim() === "";
  // if (isFirstHit) {
  //   guest.seen = [];
  //   guest.states = [];
  //   guest.intent = '';
  //   guest.last_intent = '';
  //   console.log('RELOAD', guestId)
  // }

  if (body.input.trim()) {                           // гость что-то ввёл
    const node = flow[body.state];      // узел, который видит клиент
    const isButton = node.buttons?.some(
      b => b.toLowerCase() === body.input.trim().toLowerCase()
    );

    guest.last_intent = guest.intent;
    const tag = await detectIntent(body.input, node.allowedIntents);
    guest.intent = tag;
    console.log("Intent: " + tag, guestId)

    // if (tag !== "unknown" && flow[nodeId]) {                         // 1) узнали тег
    //   const nodeId = INTENTS[tag];
    //   const result = await runFlow(nodeId, "", guest); // идём прямо в узел
    //   return Response.json(result);
    // } else {
    //   const result = await runFlow("unknown", body.input, guest);                                  // 2) не поняли
    //   return Response.json(result);
    // }

    // console.log(node, isButton)

    // if (body.input.trim() && !isButton) {
    //   const tag = await detectIntent(body.input);
    //   const nodeId = INTENTS[tag as Intent];

    //   console.log("Intent: " + tag)

    //   if (tag !== "unknown" && flow[nodeId]) {                         // 1) узнали тег
    //     const nodeId = INTENTS[tag];
    //     const result = await runFlow(nodeId, "", guest); // идём прямо в узел
    //     return Response.json(result);
    //   } else {
    //     const result = await runFlow("unknown", body.input, guest);                                  // 2) не поняли
    //     return Response.json(result);
    //   }
    // }
  }

  /* run normal flow with ctx = guest */
  const res = await runFlow(body.state, body.input, guest);
  await saveGuest(guest);          // <── persist back to KV
  return Response.json(res);
}

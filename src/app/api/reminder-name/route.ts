import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST() {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 50,
    messages: [
      {
        role: "user",
        content:
          "Гость не указал фамилию. Отреагируй и сновы попроси имя, и фамилию " +
          "для списка гостей свадьбы. До 20 слов. На русском.",
      },
    ],
  });
  return Response.json({ text: res.choices[0].message?.content ?? "" });
}

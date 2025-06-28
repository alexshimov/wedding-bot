import { google } from "googleapis";
import { JWT }    from "google-auth-library";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const SHEET_ID = process.env.SHEET_ID!;          // put in .env.local
const HEADER_RANGE = "Guests!A1:I";
const DATA_RANGE    = "Guests!A2:I";                  // id | name | stays | diet | rsvp | wish | …

let headerIndex: Record<string, number> | null = null;

const auth = new JWT({
  email: process.env.GSA_EMAIL!,
  key:   process.env.GSA_PRIVATE_KEY!.replace(/\\n/g, "\n"),
  scopes: SCOPES,
});
const sheets = google.sheets({ version: "v4", auth });

async function readHeader() {
  if (headerIndex) return headerIndex;

  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: HEADER_RANGE,
  });
  headerIndex = Object.fromEntries(
    (data.values?.[0] ?? []).map((h, i) => [h.trim().toLowerCase(), i])
  );
  return headerIndex;
}

export async function loadGuests() {
  const headers = await readHeader();

  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: DATA_RANGE,
  });
  console.log(data.values[1])
  return (data.values ?? []).map((row, i) => ({
    id:     row[ headers.id    ],
    name:   row[ headers.name  ],
    stays:  (row[ headers.stays ] ?? "").toLowerCase() === "yes",
    diet_ask:   row[ headers.diet_ask  ] ?? "",
    rsvp_ask:   row[ headers.rsvp_ask  ] ?? "",
    wish:   row[ headers.wish  ] ?? "",
    intro:  row[ headers.intro ] ?? "",
    story_complete:  row[ headers.story_complete] ? row[ headers.story_complete] !== "" : false,
    rowNumber: 2 + i,
  }));
}

export async function updateGuest(row: number, field: string, value: string) {
  const col = (await readHeader())[field.toLowerCase()];
  const range = `Guests!${String.fromCharCode(65 + col)}${row}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: "RAW",
    requestBody: { values: [[value]] },
  });
}

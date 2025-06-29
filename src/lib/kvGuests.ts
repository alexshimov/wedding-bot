// lib/kvGuests.ts
import { kv } from '@vercel/kv';
import { loadGuests as loadSheetGuests } from '@/lib/sheets';

/* ───────── read once, cache in KV, always JSON ───────── */

export async function getGuest(id: string) {
  const key = `guest:${id}`;
  let guest = await kv.get<typeof import('@/lib/types').Guest>(key);

  if (!guest) {                         // 1st hit / cache‑miss
    const fresh = await loadSheetGuests();
    guest = fresh.find(g => g.id === id);
    if (guest) await kv.set(key, guest, { ex: 60 * 60 }); // 1 h TTL
  }
  return guest;
}

/* every time you mutate the object call saveGuest() */
export async function saveGuest(guest: any) {
  await kv.set(`guest:${guest.id}`, guest, { ex: 60 * 60 });
}

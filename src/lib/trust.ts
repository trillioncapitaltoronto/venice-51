import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";

const handleRe = /^[A-Za-z0-9_@.\-+]{2,64}$/;

function cleanHandle(raw: string) {
  const h = raw.trim().replace(/^@/, "");
  if (!handleRe.test(h)) throw new Error("Discord name looks wrong.");
  return h;
}

export type Score = { discord: string; fills: number };

export const getScore = createServerFn({ method: "GET" })
  .validator((input: { discord: string }) => ({ discord: cleanHandle(input.discord) }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const fills = await sql<{ n: number }>`
      select count(*)::int as n from fills
      where lower(poster_discord) = lower(${data.discord})
         or lower(counterparty_discord) = lower(${data.discord})
    `;
    return {
      discord: data.discord,
      fills: fills[0]?.n ?? 0,
    } satisfies Score;
  });

export const markFilled = createServerFn({ method: "POST" })
  .validator((input: { listingId: number; counterparty: string }) => ({
    listingId: input.listingId,
    counterparty: cleanHandle(input.counterparty),
  }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const listing = await sql<{ id: number; contact_handle: string; status: string }>`
      select id, contact_handle, status from listings where id = ${data.listingId}
    `;
    const row = listing[0];
    if (!row || row.status !== "open") throw new Error("Ticket is not open.");
    if (row.contact_handle.toLowerCase() === data.counterparty.toLowerCase()) {
      throw new Error("Counterparty has to be the other Discord name.");
    }
    await sql`
      insert into fills (listing_id, poster_discord, counterparty_discord)
      values (${row.id}, ${row.contact_handle}, ${data.counterparty})
    `;
    await sql`update listings set status = 'filled' where id = ${row.id}`;
    return { ok: true };
  });

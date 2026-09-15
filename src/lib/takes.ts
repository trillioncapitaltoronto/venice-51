import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import type { CarbonChain } from "@/lib/carbon-config";

const handleRe = /^[A-Za-z0-9_@.\-+]{2,64}$/;

export type PublicTake = {
  id: number;
  listingId: number;
  discord: string;
  wallet: string;
  notes: string;
  createdAt: string;
};

let takesReady = false;

async function ensureTakes(sql: Awaited<ReturnType<typeof getSql>>) {
  if (takesReady) return;
  await sql.query(`
    create table if not exists takes (
      id serial primary key,
      listing_id int not null,
      discord text not null,
      wallet text not null default '',
      notes text not null default '',
      status text not null default 'open',
      created_at timestamptz not null default now()
    )
  `);
  takesReady = true;
}

export const listTakes = createServerFn({ method: "GET" })
  .validator((input: { listingId: number }) => input)
  .handler(async ({ data }) => {
    const sql = await getSql();
    await ensureTakes(sql);
    const rows = await sql<{
      id: number;
      listing_id: number;
      discord: string;
      wallet: string;
      notes: string;
      created_at: string;
    }>`
      select id, listing_id, discord, wallet, notes, created_at::text as created_at
      from takes
      where listing_id = ${data.listingId} and status = 'open'
      order by created_at desc
    `;
    return rows.map(
      (r) =>
        ({
          id: r.id,
          listingId: r.listing_id,
          discord: r.discord,
          wallet: r.wallet,
          notes: r.notes,
          createdAt: r.created_at,
        }) satisfies PublicTake,
    );
  });

export const postTake = createServerFn({ method: "POST" })
  .validator((input: {
    listingId: number;
    discord: string;
    wallet: string;
    notes: string;
    passChain?: CarbonChain | "";
    passAddress?: string;
  }) => {
    const discord = input.discord.trim().replace(/^@/, "");
    if (!handleRe.test(discord)) throw new Error("Discord name looks wrong.");
    const wallet = input.wallet.trim();
    if (wallet.length < 8 || wallet.length > 160) throw new Error("Wallet looks wrong.");
    const passAddress = (input.passAddress ?? "").trim();
    const passChain = input.passChain || undefined;
    if (passChain && passChain !== "kda" && passChain !== "kas" && passChain !== "nexa") {
      throw new Error("Pick Kadena, Kaspa, or Nexa for TCTC.");
    }
    return {
      listingId: input.listingId,
      discord,
      wallet,
      notes: (input.notes ?? "").slice(0, 280),
      passChain,
      passAddress,
    };
  })
  .handler(async ({ data }) => {
    const sql = await getSql();
    await ensureTakes(sql);
    const listing = await sql<{
      id: number;
      contact_handle: string;
      status: string;
      coin: string;
    }>`
      select id, contact_handle, status, coin from listings where id = ${data.listingId}
    `;
    const row = listing[0];
    if (!row || row.status !== "open") throw new Error("Ticket is not open.");
    if (row.contact_handle.toLowerCase() === data.discord.toLowerCase()) {
      throw new Error("That's your own ticket.");
    }
    await (await import("./floor")).assertFloorAccess({
      sql,
      discord: data.discord,
      passChain: data.passChain,
      passAddress: data.passAddress,
      listingCoin: row.coin,
      listingWallet: data.wallet,
    });
    const created = await sql<{ id: number }>`
      insert into takes (listing_id, discord, wallet, notes, status)
      values (${data.listingId}, ${data.discord}, ${data.wallet}, ${data.notes}, 'open')
      returning id
    `;
    return { id: created[0].id };
  });

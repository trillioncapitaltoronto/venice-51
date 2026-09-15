import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { QUOTES, TICKERS } from "@/lib/coins";
import { fundedEnough, watchBalance } from "@/lib/proof";

const amountRe = /^\d+(\.\d{1,8})?$/;
const handleRe = /^[A-Za-z0-9_@.\-+]{2,64}$/;

const tickerZ = z.enum(TICKERS as unknown as [string, ...string[]]);
const quoteZ = z.enum(QUOTES);

export type PublicListing = {
  id: number;
  side: "buy" | "sell";
  coin: string;
  amount: string;
  quoteAsset: string;
  price: string;
  settlement: string;
  notes: string;
  discord: string;
  referredBy: string;
  status: string;
  createdAt: string;
  funded: boolean;
  wallet: string;
  walletBalance: string;
  vouched: boolean;
  fills: number;
};

let walletColsReady = false;

async function ensureWalletCols(sql: Awaited<ReturnType<typeof getSql>>) {
  if (walletColsReady) return;
  await sql.query(
    "alter table listings add column if not exists wallet_address text not null default ''",
  );
  await sql.query(
    "alter table listings add column if not exists wallet_balance text not null default ''",
  );
  await sql.query(
    "alter table listings add column if not exists wallet_verified boolean not null default false",
  );
  await sql.query(
    "alter table listings add column if not exists wallet_checked_at timestamptz",
  );
  walletColsReady = true;
}

function mapRow(r: {
  id: number;
  side: string;
  coin: string;
  amount: string;
  quote_asset: string;
  price: string;
  settlement: string;
  notes: string;
  contact_handle: string;
  referred_by?: string;
  status: string;
  created_at: string;
  wallet_address?: string;
  wallet_balance?: string;
  wallet_verified?: boolean;
  vouch_confirmed?: boolean;
  fills?: number;
}): PublicListing {
  return {
    id: r.id,
    side: r.side as "buy" | "sell",
    coin: r.coin,
    amount: r.amount,
    quoteAsset: r.quote_asset,
    price: r.price,
    settlement: r.settlement,
    notes: r.notes,
    discord: r.contact_handle,
    referredBy: r.referred_by ?? "",
    status: r.status,
    createdAt: r.created_at,
    funded: Boolean(r.wallet_verified),
    wallet: r.wallet_address ?? "",
    walletBalance: r.wallet_balance ?? "",
    vouched: Boolean(r.vouch_confirmed),
    fills: Number(r.fills ?? 0),
  };
}


export const listListings = createServerFn({ method: "GET" })
  .validator(
    (input: { coin?: string; side?: string } | undefined) => input ?? {},
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    await ensureWalletCols(sql);
    const coin = data.coin && TICKERS.includes(data.coin as never) ? data.coin : null;
    const side = data.side === "buy" || data.side === "sell" ? data.side : null;
    const clauses = ["l.status = 'open'"];
    const params: unknown[] = [];
    if (coin) {
      params.push(coin);
      clauses.push(`l.coin = $${params.length}`);
    }
    if (side) {
      params.push(side);
      clauses.push(`l.side = $${params.length}`);
    }
    const rows = await sql.query<{
      id: number;
      side: string;
      coin: string;
      amount: string;
      quote_asset: string;
      price: string;
      settlement: string;
      notes: string;
      contact_handle: string;
      status: string;
      created_at: string;
      wallet_address: string;
      wallet_balance: string;
      wallet_verified: boolean;
      vouch_confirmed: boolean;
      fills: number;
    }>(
      `select l.id, l.side, l.coin, l.amount, l.quote_asset, l.price,
              l.settlement, l.notes, l.contact_handle, coalesce(l.referred_by,'') as referred_by, l.status, l.created_at,
              coalesce(l.wallet_address,'') as wallet_address,
              coalesce(l.wallet_balance,'') as wallet_balance,
              coalesce(l.wallet_verified,false) as wallet_verified,
              coalesce(l.vouch_confirmed,false) as vouch_confirmed,
              (
                select count(*)::int from fills f
                where lower(f.poster_discord) = lower(l.contact_handle)
                   or lower(f.counterparty_discord) = lower(l.contact_handle)
              ) as fills
       from listings l
       where ${clauses.join(" and ")}
       order by l.created_at desc
       limit 200`,
      params,
    );
    return rows.map(mapRow);
  });

export const listingStats = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<{
    open_count: number;
    buy_count: number;
    sell_count: number;
    coin_count: number;
  }>`
    select
      count(*)::int as open_count,
      count(*) filter (where side = 'buy')::int as buy_count,
      count(*) filter (where side = 'sell')::int as sell_count,
      count(distinct coin)::int as coin_count
    from listings
    where status = 'open'
  `;
  return rows[0] ?? { open_count: 0, buy_count: 0, sell_count: 0, coin_count: 0 };
});

export const getListing = createServerFn({ method: "GET" })
  .validator((input: { id: number }) => input)
  .handler(async ({ data }) => {
    const sql = await getSql();
    await ensureWalletCols(sql);
    const rows = await sql<{
      id: number;
      side: string;
      coin: string;
      amount: string;
      quote_asset: string;
      price: string;
      settlement: string;
      notes: string;
      contact_handle: string;
      status: string;
      created_at: string;
      wallet_address: string;
      wallet_balance: string;
      wallet_verified: boolean;
      vouch_confirmed: boolean;
      fills: number;
    }>`
      select l.id, l.side, l.coin, l.amount, l.quote_asset, l.price,
             l.settlement, l.notes, l.contact_handle, coalesce(l.referred_by,'') as referred_by, l.status, l.created_at,
             coalesce(l.wallet_address,'') as wallet_address,
             coalesce(l.wallet_balance,'') as wallet_balance,
             coalesce(l.wallet_verified,false) as wallet_verified,
             coalesce(l.vouch_confirmed,false) as vouch_confirmed,
             (
               select count(*)::int from fills f
               where lower(f.poster_discord) = lower(l.contact_handle)
                  or lower(f.counterparty_discord) = lower(l.contact_handle)
             ) as fills
      from listings l
      where l.id = ${data.id}
    `;
    const row = rows[0];
    if (!row) return null;
    if (row.wallet_address) {
      try {
        const proof = await watchBalance(row.coin, row.wallet_address);
        const verified = proof.ok && fundedEnough(proof.balance, row.amount);
        await sql`
          update listings
          set wallet_balance = ${proof.balance},
              wallet_verified = ${verified},
              wallet_checked_at = now()
          where id = ${row.id}
        `;
        row.wallet_balance = proof.balance;
        row.wallet_verified = verified;
      } catch {
        /* keep last check */
      }
    }
    return mapRow(row);
  });

const offerInput = z.object({
  side: z.enum(["buy", "sell"]),
  coin: tickerZ,
  amount: z.string().regex(amountRe, "Amount must be a decimal"),
  quoteAsset: quoteZ,
  price: z.string().regex(amountRe, "Price must be a decimal"),
  notes: z.string().max(280),
  discord: z.string().regex(handleRe, "Discord name looks wrong"),
  wallet: z.string().min(8).max(128),
});

export const postOffer = createServerFn({ method: "POST" })
  .validator((input: z.infer<typeof offerInput>) => offerInput.parse(input))
  .handler(async ({ data }) => {
    const sql = await getSql();
    await ensureWalletCols(sql);
    const discord = data.discord.replace(/^@/, "");
    const wallet = data.wallet.trim();
    const proof = await watchBalance(data.coin, wallet);
    const verified = proof.ok && fundedEnough(proof.balance, data.amount);
    const rows = await sql<{ id: number }>`
      insert into listings (
        user_id, side, coin, amount, quote_asset, price, settlement, notes,
        contact_channel, contact_handle, referred_by, status,
        wallet_address, wallet_balance, wallet_verified, wallet_checked_at
      ) values (
        ${discord}, ${data.side}, ${data.coin}, ${data.amount},
        ${data.quoteAsset}, ${data.price}, 'onchain', ${data.notes.trim()},
        'discord', ${discord}, '', 'open',
        ${wallet}, ${proof.balance}, ${verified}, now()
      )
      returning id
    `;
    return { id: rows[0].id, funded: verified, proofError: verified ? null : proof.error ?? "Wallet is short of the size." };
  });

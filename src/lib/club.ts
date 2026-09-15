import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";

const handleRe = /^[A-Za-z0-9_@.\-+]{2,64}$/;

export function cleanHandle(raw: string) {
  const h = raw.trim().replace(/^@/, "");
  if (!handleRe.test(h)) throw new Error("Discord name looks wrong.");
  return h;
}

const GENESIS = ["venice", "venice_desk", "veniceotc", "founders"];

let clubReady = false;

export async function ensureClub(sql: Awaited<ReturnType<typeof getSql>>) {
  if (clubReady) return;
  await sql.query(`
    create table if not exists members (
      discord text primary key,
      referred_by text not null,
      vouched boolean not null default false,
      created_at timestamptz not null default now()
    )
  `);
  await sql.query(
    "alter table listings add column if not exists vouch_confirmed boolean not null default false",
  );
  await sql.query(`
    insert into members (discord, referred_by, vouched)
    values ('venice','founders',true), ('venice_desk','founders',true), ('veniceotc','founders',true)
    on conflict (discord) do nothing
  `);
  clubReady = true;
}

export async function isVouched(sql: Awaited<ReturnType<typeof getSql>>, discord: string) {
  await ensureClub(sql);
  const name = discord.toLowerCase();
  if (GENESIS.includes(name)) return true;
  const rows = await sql<{ vouched: boolean }>`
    select vouched from members where lower(discord) = ${name}
  `;
  return Boolean(rows[0]?.vouched);
}

export async function requireReferral(
  sql: Awaited<ReturnType<typeof getSql>>,
  discord: string,
  referredBy: string,
) {
  await ensureClub(sql);
  if (discord.toLowerCase() === referredBy.toLowerCase()) {
    throw new Error("You cannot refer yourself.");
  }
  const ok = await isVouched(sql, referredBy);
  if (!ok) {
    throw new Error(
      `@${referredBy} is not in the chain yet. They have to be vouched before they can put their name on you.`,
    );
  }
  await sql`
    insert into members (discord, referred_by, vouched)
    values (${discord}, ${referredBy}, false)
    on conflict (discord) do nothing
  `;
}

export const confirmVouch = createServerFn({ method: "POST" })
  .validator((input: { listingId: number; referrer: string }) => ({
    listingId: input.listingId,
    referrer: cleanHandle(input.referrer),
  }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    await ensureClub(sql);
    const listing = await sql<{ contact_handle: string; referred_by: string }>`
      select contact_handle, coalesce(referred_by,'') as referred_by
      from listings where id = ${data.listingId}
    `;
    const row = listing[0];
    if (!row?.referred_by) throw new Error("This ticket has no referral.");
    if (row.referred_by.toLowerCase() !== data.referrer.toLowerCase()) {
      throw new Error("Only the named referrer can vouch. Your name is on the line.");
    }
    const ok = await isVouched(sql, data.referrer);
    if (!ok) throw new Error("You are not in the chain yet.");
    await sql`
      update listings set vouch_confirmed = true
      where id = ${data.listingId}
    `;
    await sql`
      update members set vouched = true, referred_by = ${data.referrer}
      where lower(discord) = lower(${row.contact_handle})
    `;
    await sql`
      insert into members (discord, referred_by, vouched)
      values (${row.contact_handle}, ${data.referrer}, true)
      on conflict (discord) do update set vouched = true, referred_by = excluded.referred_by
    `;
    return { ok: true };
  });

export const vouchChain = createServerFn({ method: "GET" })
  .validator((input: { discord: string }) => ({ discord: cleanHandle(input.discord) }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    await ensureClub(sql);
    const chain: string[] = [];
    let cur = data.discord;
    for (let i = 0; i < 12; i += 1) {
      const rows = await sql<{ discord: string; referred_by: string; vouched: boolean }>`
        select discord, referred_by, vouched from members where lower(discord) = ${cur.toLowerCase()}
      `;
      const row = rows[0];
      if (!row) break;
      chain.push(row.discord);
      if (!row.referred_by || GENESIS.includes(row.referred_by.toLowerCase())) break;
      if (chain.some((n) => n.toLowerCase() === row.referred_by.toLowerCase())) break;
      cur = row.referred_by;
    }
    return chain;
  });

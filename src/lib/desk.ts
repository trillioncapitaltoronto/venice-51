import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { env } from "@/lib/env.server";

const handleRe = /^[A-Za-z0-9_@.\-+]{2,64}$/;

function cleanHandle(raw: string) {
  const h = raw.trim().replace(/^@/, "");
  if (!handleRe.test(h)) throw new Error("Discord name looks wrong.");
  return h;
}

function deskKey() {
  return env("DESK_KEY");
}

function keyOk(given: string) {
  const want = deskKey();
  if (!want) throw new Error("Desk key is not set.");
  if (given.length !== want.length) return false;
  let d = 0;
  for (let i = 0; i < want.length; i++) d |= given.charCodeAt(i) ^ want.charCodeAt(i);
  return d === 0;
}

function envPosters() {
  return (env("POSTERS") ?? "")
    .split(",")
    .map((s) => s.trim().replace(/^@/, "").toLowerCase())
    .filter(Boolean);
}

let postersReady = false;

export async function ensurePosters(sql: Awaited<ReturnType<typeof getSql>>) {
  if (postersReady) return;
  await sql.query(`
    create table if not exists posters (
      discord text primary key,
      granted_at timestamptz not null default now()
    )
  `);
  postersReady = true;
}

export async function isGranted(sql: Awaited<ReturnType<typeof getSql>>, discord: string) {
  if (!deskKey()) return true;
  await ensurePosters(sql);
  const name = discord.replace(/^@/, "").toLowerCase();
  if (envPosters().includes(name)) return true;
  const rows = await sql<{ n: number }>`
    select count(*)::int as n from posters where lower(discord) = ${name}
  `;
  return (rows[0]?.n ?? 0) > 0;
}

export const listPosters = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  await ensurePosters(sql);
  const rows = await sql<{ discord: string; granted_at: string }>`
    select discord, granted_at::text as granted_at from posters order by granted_at desc
  `;
  const extra = envPosters().filter((n) => !rows.some((r) => r.discord.toLowerCase() === n));
  return [
    ...rows.map((r) => ({ discord: r.discord, grantedAt: r.granted_at })),
    ...extra.map((discord) => ({ discord, grantedAt: "env" })),
  ];
});

export const grantPoster = createServerFn({ method: "POST" })
  .validator((input: { deskKey: string; discord: string }) => ({
    deskKey: input.deskKey,
    discord: cleanHandle(input.discord),
  }))
  .handler(async ({ data }) => {
    if (!keyOk(data.deskKey)) throw new Error("Desk key is wrong.");
    const sql = await getSql();
    await ensurePosters(sql);
    await sql`
      insert into posters (discord) values (${data.discord})
      on conflict (discord) do nothing
    `;
    return { ok: true, discord: data.discord };
  });

export const revokePoster = createServerFn({ method: "POST" })
  .validator((input: { deskKey: string; discord: string }) => ({
    deskKey: input.deskKey,
    discord: cleanHandle(input.discord),
  }))
  .handler(async ({ data }) => {
    if (!keyOk(data.deskKey)) throw new Error("Desk key is wrong.");
    const sql = await getSql();
    await ensurePosters(sql);
    await sql`delete from posters where lower(discord) = lower(${data.discord})`;
    return { ok: true };
  });

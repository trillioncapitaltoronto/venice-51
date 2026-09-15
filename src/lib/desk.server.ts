import { getSql, type Sql } from "@/lib/db";
import { env } from "@/lib/env.server";

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

export async function ensurePosters(sql: Sql) {
  if (postersReady) return;
  await sql.query(`
    create table if not exists posters (
      discord text primary key,
      granted_at timestamptz not null default now()
    )
  `);
  postersReady = true;
}

export async function isGranted(sql: Sql, discord: string) {
  if (!deskKey()) return true;
  const name = discord.replace(/^@/, "").toLowerCase();
  if (envPosters().includes(name)) return true;
  await ensurePosters(sql);
  const rows = await sql<{ n: number }>`
    select count(*)::int as n from posters where lower(discord) = ${name}
  `;
  return (rows[0]?.n ?? 0) > 0;
}

export async function listImpl() {
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
}

export async function grantImpl(deskKeyValue: string, discord: string) {
  if (!keyOk(deskKeyValue)) throw new Error("Desk key is wrong.");
  const sql = await getSql();
  await ensurePosters(sql);
  await sql`
    insert into posters (discord) values (${discord})
    on conflict (discord) do nothing
  `;
  return { ok: true as const, discord };
}

export async function revokeImpl(deskKeyValue: string, discord: string) {
  if (!keyOk(deskKeyValue)) throw new Error("Desk key is wrong.");
  const sql = await getSql();
  await ensurePosters(sql);
  await sql`delete from posters where lower(discord) = lower(${discord})`;
  return { ok: true as const };
}

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
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

type FilePoster = { discord: string; grantedAt: string };

function postersPath() {
  const dir = process.env.PGLITE_DATA_DIR?.trim() || tmpdir();
  mkdirSync(dir, { recursive: true });
  return join(dir, "venice-posters.json");
}

function readFilePosters(): FilePoster[] {
  try {
    const raw = readFileSync(postersPath(), "utf8");
    const parsed = JSON.parse(raw) as FilePoster[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeFilePosters(rows: FilePoster[]) {
  writeFileSync(postersPath(), JSON.stringify(rows), "utf8");
}

export async function isGranted(_sql: unknown, discord: string) {
  if (!deskKey()) return true;
  const name = discord.replace(/^@/, "").toLowerCase();
  if (envPosters().includes(name)) return true;
  return readFilePosters().some((p) => p.discord.toLowerCase() === name);
}

export async function listImpl() {
  const rows = readFilePosters();
  const extra = envPosters().filter((n) => !rows.some((r) => r.discord.toLowerCase() === n));
  return [
    ...rows.map((r) => ({ discord: r.discord, grantedAt: r.grantedAt })),
    ...extra.map((discord) => ({ discord, grantedAt: "env" })),
  ];
}

export async function grantImpl(deskKeyValue: string, discord: string) {
  if (!keyOk(deskKeyValue)) throw new Error("Desk key is wrong.");
  const rows = readFilePosters();
  if (!rows.some((p) => p.discord.toLowerCase() === discord.toLowerCase())) {
    rows.unshift({ discord, grantedAt: new Date().toISOString() });
    writeFilePosters(rows);
  }
  return { ok: true as const, discord };
}

export async function revokeImpl(deskKeyValue: string, discord: string) {
  if (!keyOk(deskKeyValue)) throw new Error("Desk key is wrong.");
  writeFilePosters(readFilePosters().filter((p) => p.discord.toLowerCase() !== discord.toLowerCase()));
  return { ok: true as const };
}

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { getSql } from "@/lib/db";
import { ticketCode } from "@/lib/handshake";

export type Print = {
  listingId: number;
  code: string;
  coin: string;
  amount: string;
  price: string;
  poster: string;
  other: string;
  posterWallet: string;
  otherWallet: string;
  posterSaid: boolean;
  otherSaid: boolean;
  printedAt: string | null;
  status: "pending" | "printed";
};

function printsPath() {
  const dir = process.env.PGLITE_DATA_DIR?.trim() || tmpdir();
  mkdirSync(dir, { recursive: true });
  return join(dir, "venice-prints.json");
}

export function readPrints(): Print[] {
  try {
    const parsed = JSON.parse(readFileSync(printsPath(), "utf8")) as Print[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writePrints(rows: Print[]) {
  writeFileSync(printsPath(), JSON.stringify(rows));
}

export function listTapeImpl() {
  return readPrints()
    .filter((p) => p.status === "printed")
    .sort((a, b) => String(b.printedAt).localeCompare(String(a.printedAt)));
}

export function getPrintImpl(listingId: number) {
  return readPrints().find((p) => p.listingId === listingId) ?? null;
}

export async function stampPrintImpl(data: {
  listingId: number;
  discord: string;
  counterparty: string;
}) {
  const sql = await getSql();
  const listing = await sql<{
    id: number;
    contact_handle: string;
    status: string;
    coin: string;
    amount: string;
    price: string;
    wallet_address: string;
  }>`
    select id, contact_handle, status, coin, amount, price, wallet_address
    from listings where id = ${data.listingId}
  `;
  const row = listing[0];
  if (!row) throw new Error("Ticket not found.");
  if (row.status !== "open" && row.status !== "filled") {
    throw new Error("This ticket is not live.");
  }
  const poster = row.contact_handle.replace(/^@/, "");
  const you = data.discord;
  const them = data.counterparty;
  if (you.toLowerCase() === them.toLowerCase()) {
    throw new Error("The other name has to be the other person.");
  }
  const youArePoster = you.toLowerCase() === poster.toLowerCase();
  if (youArePoster && them.toLowerCase() === poster.toLowerCase()) {
    throw new Error("Name the person you printed with.");
  }
  if (!youArePoster && them.toLowerCase() !== poster.toLowerCase()) {
    throw new Error(`If you are not the ticket, name @${poster}.`);
  }

  let takes: { discord: string; wallet: string }[] = [];
  try {
    takes = await sql<{ discord: string; wallet: string }>`
      select discord, wallet from takes where listing_id = ${row.id}
    `;
  } catch {
    takes = [];
  }
  const otherName = youArePoster ? them : you;
  const otherWallet =
    takes.find((t) => t.discord.toLowerCase() === otherName.toLowerCase())?.wallet ?? "";

  const rows = readPrints();
  let print = rows.find((p) => p.listingId === row.id);
  if (print?.status === "printed") throw new Error("Already on the tape.");
  if (!print) {
    print = {
      listingId: row.id,
      code: ticketCode(row.id),
      coin: row.coin,
      amount: row.amount,
      price: row.price,
      poster,
      other: otherName,
      posterWallet: row.wallet_address ?? "",
      otherWallet,
      posterSaid: false,
      otherSaid: false,
      printedAt: null,
      status: "pending",
    };
    rows.unshift(print);
  }
  if (print.other.toLowerCase() !== otherName.toLowerCase()) {
    throw new Error(`This ticket is already waiting on @${print.other}.`);
  }
  if (youArePoster) print.posterSaid = true;
  else print.otherSaid = true;
  if (otherWallet) print.otherWallet = otherWallet;

  if (print.posterSaid && print.otherSaid) {
    print.status = "printed";
    print.printedAt = new Date().toISOString();
    await sql`update listings set status = 'filled' where id = ${row.id}`;
    try {
      await sql`
        insert into fills (listing_id, poster_discord, counterparty_discord)
        values (${row.id}, ${poster}, ${print.other})
      `;
    } catch {
      /* already filled */
    }
  }
  writePrints(rows);
  return print;
}

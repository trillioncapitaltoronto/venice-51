import type { PublicListing } from "@/lib/listings";

export function ticketCode(id: number) {
  return `V51-${id}`;
}

export function discordOpener(row: PublicListing) {
  const side = row.side === "buy" ? "BID" : "OFFER";
  return `PUBLIC ${ticketCode(row.id)} ${side} ${row.amount} ${row.coin} @ ${row.price} BCH — @${row.discord.replace(/^@/, "")}`;
}

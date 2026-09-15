export const COINS = [
  { ticker: "WART", name: "Warthog" },
  { ticker: "KDA", name: "Kadena" },
  { ticker: "HNS", name: "Handshake" },
  { ticker: "XMR", name: "Monero" },
  { ticker: "KAS", name: "Kaspa" },
  { ticker: "BCH", name: "Bitcoin Cash" },
  { ticker: "NEXA", name: "Nexa" },
  { ticker: "ERG", name: "Ergo" },
  { ticker: "ETI", name: "Etica" },
] as const;

export type CoinTicker = (typeof COINS)[number]["ticker"];

export const QUOTES = ["BCH"] as const;
export type QuoteAsset = (typeof QUOTES)[number];

export const SETTLEMENTS = [
  { id: "onchain", label: "On-chain swap" },
  { id: "bank", label: "Bank / wire" },
  { id: "crypto", label: "Other crypto" },
] as const;

export const CHANNELS = [
  { id: "telegram", label: "Telegram" },
  { id: "discord", label: "Discord" },
  { id: "x", label: "X" },
  { id: "email", label: "Email" },
] as const;

export const TICKERS = COINS.map((c) => c.ticker);

export function coinName(ticker: string) {
  return COINS.find((c) => c.ticker === ticker)?.name ?? ticker;
}

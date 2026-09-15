export const CARBON_TICKER = "TCTC";
export const CARBON_NAME = "Trillion Carbon";
export const CARBON_SUPPLY_TOTAL = 3_000_000;
export const CARBON_SUPPLY_PER_CHAIN = 1_000_000;
export const DISCORD_INVITE = "https://discord.gg/MTKwbkCmF";
export const DISCORD_NAME = "Trillion Discord";

export type CarbonChain = "kas" | "kda" | "nexa";

export type TctcChain = {
  id: CarbonChain;
  name: string;
  ticker: string;
  /** Pact module, KRC-20 ticker, or Nexa group id. Empty = not wired yet. */
  tokenId: string;
  supply: number;
  decimals: number;
  dexName: string;
  dexUrl: string;
  explorerName: string;
  parentWallet: string;
  ready: boolean;
};

export const TCTC_CHAINS: TctcChain[] = [
  {
    id: "kda",
    name: "Kadena",
    ticker: "TCTC",
    tokenId: "n_d8d407d0445ed92ba102c2ce678591d69e464006.TRILLIONCARBON",
    supply: 1_000_001,
    decimals: 12,
    dexName: "Mercatus",
    dexUrl:
      "https://www.mercatus.works/token-info/n_d8d407d0445ed92ba102c2ce678591d69e464006.TRILLIONCARBON",
    explorerName: "Kadena explorer",
    parentWallet: "",
    ready: true,
  },
  {
    id: "kas",
    name: "Kaspa",
    ticker: "TCTC",
    tokenId: "TCTC",
    supply: 1_000_000,
    decimals: 8,
    dexName: "Kaspa.com",
    dexUrl: "https://kaspa.com/tokens/marketplace/token/TCTC",
    explorerName: "Kaspa explorer",
    parentWallet: "kaspa:qry9v4d22t2h9qaehl7gjmh9wuvmz0a9r3vx4ezl3gna7mvedjenvjhz26l0p",
    ready: true,
  },
  {
    id: "nexa",
    name: "Nexa",
    ticker: "TCTC",
    tokenId: "",
    supply: 1_000_000,
    decimals: 0,
    dexName: "",
    dexUrl: "",
    explorerName: "Nexa explorer",
    parentWallet: "",
    ready: false,
  },
];

export const KDA_TCTC = TCTC_CHAINS[0];
export const KDA_TCTC_MODULE = KDA_TCTC.tokenId;
export const KDA_TCTC_SUPPLY = KDA_TCTC.supply;
export const KDA_TCTC_DEX = KDA_TCTC.dexUrl;
export const KAS_TCTC = TCTC_CHAINS[1];

export const CARBON_DEFAULTS = {
  kas: "TCTC",
  kda: KDA_TCTC_MODULE,
  nexa: TCTC_CHAINS.find((c) => c.id === "nexa")?.tokenId ?? "TCTC",
} as const;

export function tctcChain(id: string) {
  return TCTC_CHAINS.find((c) => c.id === id) ?? null;
}

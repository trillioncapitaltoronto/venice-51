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
  dexName: string;
  dexUrl: string;
  explorerName: string;
  ready: boolean;
};

export const TCTC_CHAINS: TctcChain[] = [
  {
    id: "kda",
    name: "Kadena",
    ticker: "TCTC",
    tokenId: "n_d8d407d0445ed92ba102c2ce678591d69e464006.TRILLIONCARBON",
    supply: 1_000_001,
    dexName: "Mercatus",
    dexUrl:
      "https://www.mercatus.works/token-info/n_d8d407d0445ed92ba102c2ce678591d69e464006.TRILLIONCARBON",
    explorerName: "Kadena explorer",
    ready: true,
  },
  {
    id: "kas",
    name: "Kaspa",
    ticker: "TCTC",
    tokenId: "",
    supply: 1_000_000,
    dexName: "",
    dexUrl: "",
    explorerName: "Kaspa explorer",
    ready: false,
  },
  {
    id: "nexa",
    name: "Nexa",
    ticker: "TCTC",
    tokenId: "",
    supply: 1_000_000,
    dexName: "",
    dexUrl: "",
    explorerName: "Nexa explorer",
    ready: false,
  },
];

export const KDA_TCTC = TCTC_CHAINS[0];
export const KDA_TCTC_MODULE = KDA_TCTC.tokenId;
export const KDA_TCTC_SUPPLY = KDA_TCTC.supply;
export const KDA_TCTC_DEX = KDA_TCTC.dexUrl;

export const CARBON_DEFAULTS = {
  kas: TCTC_CHAINS.find((c) => c.id === "kas")?.tokenId ?? "TCTC",
  kda: KDA_TCTC_MODULE,
  nexa: TCTC_CHAINS.find((c) => c.id === "nexa")?.tokenId ?? "TCTC",
} as const;

export function tctcChain(id: string) {
  return TCTC_CHAINS.find((c) => c.id === id) ?? null;
}

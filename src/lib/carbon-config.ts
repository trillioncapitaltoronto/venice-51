export const CARBON_TICKER = "TCTC";
export const CARBON_NAME = "Trillion Carbon";
export const CARBON_SUPPLY_TOTAL = 3_000_000;
export const CARBON_SUPPLY_PER_CHAIN = 1_000_000;
/** Desk grant: 10,000 TCTC sent once after Discord verify. That size is the pass. */
export const TCTC_GRANT = 10_000;
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
    parentWallet: "k:828686347e98ace3ded478ee1018859a9388b3aca02dcc621f406f525518c53d",
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
    tokenId: "nexa:tpc29y9ahl0m62av6qv4n44vhl9yx8fl2prcvdmfm2zkggg75qqqq3f2seyj9",
    supply: 1_000_000,
    decimals: 2,
    dexName: "Nexa explorer",
    dexUrl:
      "https://explorer.nexa.org/token/nexa:tpc29y9ahl0m62av6qv4n44vhl9yx8fl2prcvdmfm2zkggg75qqqq3f2seyj9",
    explorerName: "Nexa explorer",
    parentWallet: "nexa:nqtsq5g5f2rgn0e2mhqkhy85ggay0se46f4vaymz4e74jsh5",
    ready: true,
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
  nexa: "nexa:tpc29y9ahl0m62av6qv4n44vhl9yx8fl2prcvdmfm2zkggg75qqqq3f2seyj9",
} as const;

export function tctcChain(id: string) {
  return TCTC_CHAINS.find((c) => c.id === id) ?? null;
}

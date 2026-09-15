export const CARBON_TICKER = "TCTC";
export const CARBON_NAME = "Trillion Carbon";
export const CARBON_SUPPLY_TOTAL = 3_000_000;
export const CARBON_SUPPLY_PER_CHAIN = 1_000_000;
export const DISCORD_INVITE = "https://discord.gg/MTKwbkCmF";
export const DISCORD_NAME = "Trillion Discord";

/** Kadena Pact module — the real TCTC. Mercatus lists this as TCTC/KDA. */
export const KDA_TCTC_MODULE =
  "n_d8d407d0445ed92ba102c2ce678591d69e464006.TRILLIONCARBON";
export const KDA_TCTC_SUPPLY = 1_000_001;
export const KDA_TCTC_DEX =
  "https://www.mercatus.works/token-info/n_d8d407d0445ed92ba102c2ce678591d69e464006.TRILLIONCARBON";

export const CARBON_DEFAULTS = {
  kas: "TCTC",
  kda: KDA_TCTC_MODULE,
  nexa: "TCTC",
} as const;

export type CarbonChain = "kas" | "kda" | "nexa";

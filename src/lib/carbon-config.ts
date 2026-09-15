export const CARBON_TICKER = "TCTC";
export const CARBON_SUPPLY_TOTAL = 3_000_000;
export const CARBON_SUPPLY_PER_CHAIN = 1_000_000;
export const DISCORD_INVITE = "https://discord.gg/sSr2zUuvV";
export const DISCORD_NAME = "Trillion Discord";

export const CARBON_DEFAULTS = {
  kas: "TCTC",
  kda: "free.tctc",
  nexa: "TCTC",
} as const;

export type CarbonChain = "kas" | "kda" | "nexa";

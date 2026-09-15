import type { CarbonChain } from "@/lib/carbon-config";
import { TCTC_GRANT, chainFromAddress, chainFromCoin } from "@/lib/carbon-config";

function asCarbonChain(v: string | undefined): CarbonChain | null {
  if (v === "kda" || v === "kas" || v === "nexa") return v;
  return null;
}

export async function assertFloorAccess(opts: {
  sql: unknown;
  discord: string;
  passChain?: string;
  passAddress?: string;
  listingCoin?: string;
  listingWallet?: string;
}) {
  let addr = (opts.passAddress ?? "").trim();
  let chain = opts.passChain;
  const fromCoin = opts.listingCoin ? chainFromCoin(opts.listingCoin) : null;
  const listingWallet = (opts.listingWallet ?? "").trim();

  if (fromCoin && listingWallet) {
    if (!addr) addr = listingWallet;
    if (!chain) chain = fromCoin;
  }

  const guessed = addr ? chainFromAddress(addr) : null;
  if (guessed) chain = guessed;

  const picked = asCarbonChain(chain);
  if (addr && picked) {
    const { inspectTctcPass } = await import("./carbon");
    const result = await inspectTctcPass(picked, addr);
    if (result.held) {
      return {
        via: "tctc" as const,
        passHeld: true,
        passChain: picked,
        passAddress: addr,
      };
    }
  }

  const { isGranted } = await import("./desk.server");
  if (await isGranted(opts.sql, opts.discord)) {
    return {
      via: "desk" as const,
      passHeld: false,
      passChain: picked ?? "",
      passAddress: addr,
    };
  }

  const where = picked
    ? ` on ${picked === "kda" ? "Kadena" : picked === "kas" ? "Kaspa" : "Nexa"}`
    : " on Kadena, Kaspa, or Nexa";
  throw new Error(
    `Need ≥ ${TCTC_GRANT.toLocaleString()} TCTC${where} in the wallet you posted — or a desk grant in Discord.`,
  );
}

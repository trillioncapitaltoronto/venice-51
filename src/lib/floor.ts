import type { CarbonChain } from "@/lib/carbon-config";
import { TCTC_GRANT } from "@/lib/carbon-config";

export async function assertFloorAccess(opts: {
  sql: unknown;
  discord: string;
  passChain?: string;
  passAddress?: string;
}) {
  const addr = (opts.passAddress ?? "").trim();
  const chain = opts.passChain;
  const validChain = chain === "kda" || chain === "kas" || chain === "nexa";
  if (addr && validChain) {
    const { inspectTctcPass } = await import("./carbon");
    const result = await inspectTctcPass(chain, addr);
    if (result.held) {
      return {
        via: "tctc" as const,
        passHeld: true,
        passChain: chain as CarbonChain,
        passAddress: addr,
      };
    }
  }
  const { isGranted } = await import("./desk.server");
  if (await isGranted(opts.sql, opts.discord)) {
    return {
      via: "desk" as const,
      passHeld: false,
      passChain: (validChain ? chain : "") as CarbonChain | "",
      passAddress: addr,
    };
  }
  throw new Error(
    `Two doors in. Hold ≥ ${TCTC_GRANT.toLocaleString()} TCTC on Kadena, Kaspa, or Nexa — or get a desk grant in Discord.`,
  );
}

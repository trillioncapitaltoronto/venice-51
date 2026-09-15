import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { CARBON_DEFAULTS, type CarbonChain } from "@/lib/carbon-config";

export type CarbonPass = {
  chain: CarbonChain;
  address: string;
  tokenRef: string;
  balance: string;
  verified: boolean;
  holder: boolean;
  checkedAt: string;
};

export const getMyPass = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{
      chain: CarbonChain;
      address: string;
      token_ref: string;
      balance: string;
      is_verified: boolean;
      holder: boolean;
      checked_at: string;
    }>`
      select chain, address, token_ref, balance, is_verified, holder, checked_at
      from carbon_passes
      where user_id = ${context.userId}
    `;
    const r = rows[0];
    if (!r) return null;
    return {
      chain: r.chain,
      address: r.address,
      tokenRef: r.token_ref,
      balance: r.balance,
      verified: Boolean(r.is_verified),
      holder: Boolean(r.holder),
      checkedAt: r.checked_at,
    } satisfies CarbonPass;
  });

export const claimPass = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { chain: CarbonChain; address: string }) => {
    const chain = input.chain;
    if (chain !== "kas" && chain !== "kda" && chain !== "nexa") {
      throw new Error("Pick Kaspa, Kadena, or Nexa.");
    }
    const address = input.address.trim();
    if (address.length < 8 || address.length > 128) throw new Error("Address looks wrong.");
    if (/[\s<>'"]/.test(address)) throw new Error("Address looks wrong.");
    return { chain, address, tokenRef: CARBON_DEFAULTS[chain] };
  })
  .handler(async ({ context, data }) => {
    let holder = false;
    let balance = "0";
    try {
      const { verifyCarbonHold } = await import("@/lib/carbon");
      const check = await verifyCarbonHold(data.chain, data.address, data.tokenRef);
      if (check.ok) {
        holder = true;
        balance = check.balance;
      }
    } catch {
      holder = false;
    }
    const sql = await getSql();
    try {
      await sql`
        insert into carbon_passes (
          user_id, chain, address, token_ref, balance, is_verified, holder, checked_at
        ) values (
          ${context.userId}, ${data.chain}, ${data.address}, ${data.tokenRef},
          ${balance}, true, ${holder}, now()
        )
        on conflict (user_id) do update set
          chain = excluded.chain,
          address = excluded.address,
          token_ref = excluded.token_ref,
          balance = excluded.balance,
          is_verified = true,
          holder = excluded.holder,
          checked_at = now()
      `;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.toLowerCase().includes("unique") || msg.toLowerCase().includes("duplicate")) {
        throw new Error("That address already claimed a pass.");
      }
      throw e;
    }
    return { verified: true, holder, balance, chain: data.chain };
  });

import { createHash } from "node:crypto";
import { CARBON_DEFAULTS, tctcChain, type CarbonChain } from "@/lib/carbon-config";

export type { CarbonChain };
export { CARBON_DEFAULTS } from "@/lib/carbon-config";

export type CarbonCheck = {
  ok: boolean;
  balance: string;
  error?: string;
};

function parseAmount(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v);
  if (v && typeof v === "object" && "balance" in v) return Number((v as { balance: string }).balance);
  return NaN;
}

async function checkKas(address: string, tick: string): Promise<CarbonCheck> {
  const ticker = tick.trim().toUpperCase();
  if (!ticker) return { ok: false, balance: "0", error: "Need the Kaspa KRC-20 ticker." };
  const url = `https://api.kasplex.org/v1/krc20/address/${encodeURIComponent(address.trim())}/token/${encodeURIComponent(ticker)}`;
  const res = await fetch(url, { headers: { accept: "application/json" } });
  const json = (await res.json()) as {
    message?: string;
    result?:
      | { balance?: string; locked?: string; dec?: string }
      | Array<{ balance?: string; locked?: string; dec?: string }>
      | null;
  };
  if (json.message === "tick invalid") {
    return { ok: false, balance: "0", error: `No KRC-20 named ${ticker} on Kaspa.` };
  }
  if (json.message === "address invalid") {
    return { ok: false, balance: "0", error: "That Kaspa address is not valid." };
  }
  const row = Array.isArray(json.result) ? json.result[0] : json.result;
  const raw = Number(row?.balance ?? "0");
  const dec = Number(row?.dec ?? 8);
  const human = Number.isFinite(raw) && Number.isFinite(dec) ? raw / 10 ** dec : NaN;
  if (!Number.isFinite(human) || human < 1) {
    return { ok: false, balance: "0", error: `No ${ticker} (need ≥ 1) on this Kaspa address.` };
  }
  return { ok: true, balance: String(human) };
}

async function checkKda(address: string, moduleName: string): Promise<CarbonCheck> {
  const mod = moduleName.trim();
  const acct = address.trim();
  if (!mod) return { ok: false, balance: "0", error: "Need the Kadena pact module." };
  if (!acct) return { ok: false, balance: "0", error: "Need a Kadena account (k:…)." };
  const cmd = JSON.stringify({
    payload: { exec: { data: {}, code: `(${mod}.get-balance "${acct}")` } },
    nonce: `venice-${Date.now()}`,
    signers: [],
    meta: {
      chainId: "2",
      sender: acct.replace(/"/g, ""),
      gasLimit: 1500,
      gasPrice: 1e-8,
      ttl: 600,
      creationTime: Math.floor(Date.now() / 1000),
    },
    networkId: "mainnet01",
  });
  const hash = createHash("blake2s256").update(cmd).digest("hex");
  const hosts = [
    "https://api.chainweb-community.org/chainweb/0.0/mainnet01/chain/2/pact/api/v1/local",
    "https://api.chainweb.com/chainweb/0.0/mainnet01/chain/2/pact/api/v1/local",
    "https://us-e1.chainweb.com/chainweb/0.0/mainnet01/chain/2/pact/api/v1/local",
  ];
  let last = "Kadena node unreachable.";
  for (const url of hosts) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cmd, hash, sigs: [] }),
      });
      const json = (await res.json()) as { result?: { status?: string; data?: unknown; error?: { message?: string } } };
      if (json.result?.status === "success") {
        const n = parseAmount(json.result.data);
        if (n > 0) return { ok: true, balance: String(n) };
        return { ok: false, balance: "0", error: `No Carbon in ${mod} on this Kadena account.` };
      }
      last = json.result?.error?.message ?? `Kadena returned ${res.status}`;
    } catch (e) {
      last = e instanceof Error ? e.message : "Kadena lookup failed.";
    }
  }
  return { ok: false, balance: "0", error: last };
}

async function checkNexa(address: string, group: string): Promise<CarbonCheck> {
  const addr = address.trim();
  const grp = group.trim();
  if (!grp) return { ok: false, balance: "0", error: "Need the Nexa token group id." };
  const url = `https://explorer.nexa.org/ext/getaddress/${encodeURIComponent(addr)}`;
  try {
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) {
      return {
        ok: false,
        balance: "0",
        error: "Nexa explorer did not return a token balance. Confirm the group id.",
      };
    }
    const json = (await res.json()) as { tokens?: Array<{ group?: string; token?: string; balance?: string | number }> };
    const row = (json.tokens ?? []).find(
      (t) => t.group === grp || t.token === grp || t.group?.includes(grp),
    );
    const n = parseAmount(row?.balance);
    if (n > 0) return { ok: true, balance: String(row?.balance) };
    return { ok: false, balance: "0", error: "No Carbon token on this Nexa address." };
  } catch (e) {
    return { ok: false, balance: "0", error: e instanceof Error ? e.message : "Nexa lookup failed." };
  }
}

export async function verifyCarbonHold(
  chain: CarbonChain,
  address: string,
  tokenRef: string,
): Promise<CarbonCheck> {
  const ref = tokenRef.trim() || CARBON_DEFAULTS[chain];
  if (chain === "kas") return checkKas(address, ref);
  if (chain === "kda") return checkKda(address, ref);
  return checkNexa(address, ref);
}

/** Token is the grant. Hold ≥ 1 TCTC on a wired chain or you cannot post. */
export async function requireTctcPass(chain: CarbonChain, address: string): Promise<CarbonCheck> {
  const spec = tctcChain(chain);
  if (!spec?.ready || !spec.tokenId) {
    throw new Error(
      `${spec?.name ?? chain} TCTC is not wired yet. Use Kadena, or wait for that chain’s token id.`,
    );
  }
  const addr = address.trim();
  if (addr.length < 8) throw new Error("TCTC wallet looks wrong.");
  const check = await verifyCarbonHold(chain, addr, spec.tokenId);
  if (!check.ok || Number(check.balance) < 1) {
    throw new Error(
      check.error ||
        "This wallet does not hold TCTC. Join Discord, get 1 sent from the parent wallet, then post.",
    );
  }
  return check;
}

import { createHash } from "node:crypto";
import { CARBON_DEFAULTS, TCTC_GRANT, tctcChain, type CarbonChain } from "@/lib/carbon-config";

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
  const chains = ["2", "0", "1"];
  const hosts = [
    "https://api.chainweb-community.org",
    "https://api.chainweb.com",
    "https://us-e1.chainweb.com",
  ];
  let last = "Kadena node unreachable.";
  for (const chainId of chains) {
    const cmd = JSON.stringify({
      payload: { exec: { data: {}, code: `(${mod}.get-balance "${acct}")` } },
      nonce: `venice-${Date.now()}`,
      signers: [],
      meta: {
        chainId,
        sender: "sender00",
        gasLimit: 15000,
        gasPrice: 0.00000001,
        ttl: 600,
        creationTime: Math.floor(Date.now() / 1000),
      },
      networkId: "mainnet01",
    });
    const hashes = [
      createHash("blake2s256").update(cmd).digest("hex"),
      createHash("blake2s256").update(cmd).digest("base64url"),
    ];
    for (const host of hosts) {
      for (const hash of hashes) {
        try {
          const res = await fetch(
            `${host}/chainweb/0.0/mainnet01/chain/${chainId}/pact/api/v1/local`,
            {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ cmd, hash, sigs: [] }),
            },
          );
          const json = (await res.json()) as {
            result?: { status?: string; data?: unknown; error?: { message?: string } };
          };
          if (json.result?.status === "success") {
            const n = parseAmount(json.result.data);
            if (n >= 1) return { ok: true, balance: String(n) };
            return { ok: false, balance: "0", error: `No TCTC on this Kadena account (chain ${chainId}).` };
          }
          last = json.result?.error?.message ?? `Kadena returned ${res.status}`;
        } catch (e) {
          last = e instanceof Error ? e.message : "Kadena lookup failed.";
        }
      }
    }
  }
  return { ok: false, balance: "0", error: last };
}

async function checkNexa(address: string, group: string): Promise<CarbonCheck> {
  const addr = address.trim();
  const grp = group.trim();
  if (!grp) return { ok: false, balance: "0", error: "Need the Nexa token group id." };
  const headers = {
    accept: "text/html,application/json",
    cookie: "nx_human=1",
  };
  try {
    const res = await fetch(
      `https://explorer.nexa.org/address/${encodeURIComponent(addr)}`,
      { headers },
    );
    const html = await res.text();
    const fromRow = nexaAmountFromHtml(html, grp);
    if (fromRow >= 1) return { ok: true, balance: String(fromRow) };
    const tok = await fetch(
      `https://explorer.nexa.org/token/${encodeURIComponent(grp)}`,
      { headers },
    );
    const tokenHtml = await tok.text();
    const fromToken = nexaAmountForAddress(tokenHtml, addr);
    if (fromToken >= 1) return { ok: true, balance: String(fromToken) };
    return { ok: false, balance: "0", error: "No TCTC (need ≥ 1) on this Nexa address." };
  } catch (e) {
    return { ok: false, balance: "0", error: e instanceof Error ? e.message : "Nexa lookup failed." };
  }
}

function nexaAmountFromHtml(html: string, group: string) {
  const tickerHit = html.match(
    new RegExp(`data-ticker="TCTC"[^>]*>[\\s\\S]{0,400}?([0-9][0-9,]*(?:\\.[0-9]+)?)\\s*TCTC`, "i"),
  );
  if (tickerHit) return Number(tickerHit[1].replace(/,/g, ""));
  const groupHit = html.match(
    new RegExp(`${group.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]{0,300}?([0-9][0-9,]*(?:\\.[0-9]+)?)\\s*TCTC`, "i"),
  );
  if (groupHit) return Number(groupHit[1].replace(/,/g, ""));
  return 0;
}

function nexaAmountForAddress(html: string, address: string) {
  const needle = address.replace(/^nexa:/, "");
  const re = new RegExp(
    `${needle}[\\s\\S]{0,400}?([0-9][0-9,]*(?:\\.[0-9]+)?)\\s*TCTC|([0-9][0-9,]*(?:\\.[0-9]+)?)\\s*TCTC[\\s\\S]{0,400}?${needle}`,
    "i",
  );
  const m = html.match(re);
  const raw = m?.[1] || m?.[2];
  return raw ? Number(raw.replace(/,/g, "")) : 0;
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

/** Token is the grant. Hold ≥ 10,000 TCTC on the chain they picked. */
export async function inspectTctcPass(chain: CarbonChain, address: string) {
  const spec = tctcChain(chain);
  if (!spec?.ready || !spec.tokenId) {
    return {
      ok: false,
      held: false,
      balance: "0",
      need: TCTC_GRANT,
      chain,
      error: `${spec?.name ?? chain} TCTC is not wired yet.`,
    };
  }
  const addr = address.trim();
  if (addr.length < 8) {
    return { ok: false, held: false, balance: "0", need: TCTC_GRANT, chain, error: "TCTC wallet looks wrong." };
  }
  const check = await verifyCarbonHold(chain, addr, spec.tokenId);
  const n = Number(check.balance);
  const held = Boolean(check.ok && Number.isFinite(n) && n + 1e-12 >= TCTC_GRANT);
  return {
    ok: check.ok,
    held,
    balance: check.balance,
    need: TCTC_GRANT,
    chain,
    error: held
      ? undefined
      : check.error ||
        `Need ≥ ${TCTC_GRANT.toLocaleString()} TCTC on ${spec.name}. Join Discord, get the grant, then check again.`,
  };
}

export async function requireTctcPass(chain: CarbonChain, address: string): Promise<CarbonCheck> {
  const result = await inspectTctcPass(chain, address);
  if (!result.held) {
    throw new Error(
      result.error ||
        `This wallet does not hold ${TCTC_GRANT.toLocaleString()} TCTC. Join Discord, get the grant, then post.`,
    );
  }
  return { ok: true, balance: result.balance };
}

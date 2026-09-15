export type Proof = {
  ok: boolean;
  balance: string;
  error?: string;
};

function num(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v);
  return NaN;
}

async function getJson(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: { accept: "application/json", ...(init?.headers ?? {}) },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error("Explorer said no.");
  return res.json() as Promise<unknown>;
}

async function wart(address: string): Promise<Proof> {
  const json = (await getJson(
    `https://warthognode.duckdns.org/account/${encodeURIComponent(address)}/balance`,
  )) as { data?: { balance?: string } };
  const n = num(json.data?.balance);
  if (!Number.isFinite(n)) return { ok: false, balance: "0", error: "WART explorer had no balance." };
  return { ok: n > 0, balance: String(n) };
}

async function kas(address: string): Promise<Proof> {
  const json = (await getJson(
    `https://api.kaspa.org/addresses/${encodeURIComponent(address)}/balance`,
  )) as { balance?: number | string };
  const sompi = num(json.balance);
  if (!Number.isFinite(sompi)) return { ok: false, balance: "0", error: "Kaspa explorer had no balance." };
  const kas = sompi / 1e8;
  return { ok: kas > 0, balance: String(kas) };
}

async function bch(address: string): Promise<Proof> {
  const bare = address.replace(/^bitcoincash:/, "");
  const json = (await getJson(
    `https://api.blockchair.com/bitcoin-cash/dashboards/address/${encodeURIComponent(bare)}?limit=1`,
  )) as { data?: Record<string, { address?: { balance?: number } }> };
  const row = json.data?.[bare] ?? json.data?.[address];
  const sats = num(row?.address?.balance);
  if (!Number.isFinite(sats)) return { ok: false, balance: "0", error: "BCH explorer had no balance." };
  const coins = sats / 1e8;
  return { ok: coins > 0, balance: String(coins) };
}

async function erg(address: string): Promise<Proof> {
  const json = (await getJson(
    `https://api.ergoplatform.com/api/v1/addresses/${encodeURIComponent(address)}/balance/confirmed`,
  )) as { nanoErgs?: number };
  const nano = num(json.nanoErgs);
  if (!Number.isFinite(nano)) return { ok: false, balance: "0", error: "Ergo explorer had no balance." };
  const coins = nano / 1e9;
  return { ok: coins > 0, balance: String(coins) };
}

async function kda(address: string): Promise<Proof> {
  const acct = address.trim();
  const cmd = JSON.stringify({
    payload: { exec: { data: {}, code: `(coin.get-balance "${acct.replace(/"/g, "")}")` } },
    nonce: `venice-${Date.now()}`,
    signers: [],
    meta: {
      chainId: "0",
      sender: "venice",
      gasLimit: 1500,
      gasPrice: 1e-8,
      ttl: 600,
      creationTime: Math.floor(Date.now() / 1000),
    },
    networkId: "mainnet01",
  });
  const { createHash } = await import("node:crypto");
  const hash = createHash("blake2s256").update(cmd).digest("base64url");
  const json = (await getJson(
    "https://api.chainweb.com/chainweb/0.0/mainnet01/chain/0/pact/api/v1/local",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ cmd, hash, sigs: [] }),
    },
  )) as { result?: { status?: string; data?: unknown } };
  if (json.result?.status !== "success") {
    return { ok: false, balance: "0", error: "Kadena node had no balance." };
  }
  const n = num(json.result.data);
  if (!Number.isFinite(n)) return { ok: false, balance: "0", error: "Kadena node had no balance." };
  return { ok: n > 0, balance: String(n) };
}

async function eti(address: string): Promise<Proof> {
  const json = (await getJson(
    `https://www.eticascan.org/apiv1/balance/address/${encodeURIComponent(address)}`,
  )) as { querysuccess?: boolean; result?: { eticas?: string } };
  if (!json.querysuccess) return { ok: false, balance: "0", error: "Eticascan had no balance." };
  const wei = num(json.result?.eticas);
  if (!Number.isFinite(wei)) return { ok: false, balance: "0", error: "Eticascan had no balance." };
  const coins = wei / 1e18;
  return { ok: coins > 0, balance: String(coins) };
}

async function hns(address: string): Promise<Proof> {
  try {
    const json = (await getJson(
      `https://e.hnsfans.com/api/address/${encodeURIComponent(address)}`,
    )) as { balance?: number | string; confirmed?: { balance?: number | string } };
    const n = num(json.balance ?? json.confirmed?.balance);
    if (Number.isFinite(n)) {
      const coins = n > 1e6 ? n / 1e6 : n;
      return { ok: coins > 0, balance: String(coins) };
    }
  } catch {
    /* fall through */
  }
  const bare = address.trim();
  const json = (await getJson(
    `https://api.blockchair.com/handshake/dashboards/address/${encodeURIComponent(bare)}?limit=1`,
  )) as { data?: Record<string, { address?: { balance?: number } }> };
  const row = json.data?.[bare];
  const raw = num(row?.address?.balance);
  if (!Number.isFinite(raw)) return { ok: false, balance: "0", error: "HNS explorer had no balance." };
  const coins = raw / 1e6;
  return { ok: coins > 0, balance: String(coins) };
}

async function nexa(address: string): Promise<Proof> {
  const addr = address.includes(":") ? address : `nexa:${address}`;
  const json = (await getJson(
    `https://tokenapi.otoplo.com/address/${encodeURIComponent(addr)}`,
  )) as { balance?: number | string; confirmed?: number | string };
  const sats = num(json.balance ?? json.confirmed);
  if (!Number.isFinite(sats)) return { ok: false, balance: "0", error: "Nexa explorer had no balance." };
  const coins = sats / 100;
  return { ok: coins > 0, balance: String(coins) };
}

export async function watchBalance(coin: string, address: string): Promise<Proof> {
  const addr = address.trim();
  if (addr.length < 8 || addr.length > 160 || /[\s<>'"]/.test(addr)) {
    return { ok: false, balance: "0", error: "Address looks wrong." };
  }
  try {
    switch (coin) {
      case "WART":
        return await wart(addr);
      case "KAS":
        return await kas(addr);
      case "BCH":
        return await bch(addr);
      case "ERG":
        return await erg(addr);
      case "KDA":
        return await kda(addr);
      case "ETI":
        return await eti(addr);
      case "HNS":
        return await hns(addr);
      case "NEXA":
        return await nexa(addr);
      case "XMR":
        return {
          ok: false,
          balance: "0",
          error: "Monero is private. We link the explorer; we cannot watch a balance without a view key.",
        };
      default:
        return {
          ok: false,
          balance: "0",
          error: `No public explorer hooked for ${coin} yet.`,
        };
    }
  } catch {
    return { ok: false, balance: "0", error: `Couldn't reach a ${coin} explorer.` };
  }
}

export function fundedEnough(balance: string, need: string) {
  const b = Number(balance);
  const n = Number(need);
  if (!Number.isFinite(b) || !Number.isFinite(n) || n <= 0) return false;
  return b + 1e-12 >= n;
}

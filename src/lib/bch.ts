import bitcore from "bitcore-lib-cash";

const FEE_SATS = 1500n;

function sortedPubs(pubs: string[]) {
  return [...pubs]
    .map((p) => p.trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

export function twoOfTwoAddress(pubs: string[]) {
  const sorted = sortedPubs(pubs);
  if (sorted.length !== 2) throw new Error("Need payer and payee public keys.");
  const keys = sorted.map((p) => new bitcore.PublicKey(p));
  const address = new bitcore.Address(keys, 2);
  return String(address);
}

type Utxo = {
  txId: string;
  outputIndex: number;
  address: string;
  script: string;
  satoshis: number;
};

async function fetchUtxos(address: string): Promise<{ utxos: Utxo[]; total: bigint }> {
  const bare = address.replace(/^bitcoincash:/, "");
  const url = `https://api.blockchair.com/bitcoin-cash/dashboards/address/${bare}?limit=50`;
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error("Could not read the BCH address.");
  const json = (await res.json()) as {
    data?: Record<
      string,
      {
        utxo?: Array<{ transaction_hash: string; index: number; value: number }>;
        address?: { script_hex?: string };
      }
    >;
  };
  const row = json.data?.[bare] ?? json.data?.[address];
  if (!row) return { utxos: [], total: 0n };
  const script = row.address?.script_hex ?? "";
  const utxos = (row.utxo ?? []).map((u) => ({
    txId: u.transaction_hash,
    outputIndex: u.index,
    address,
    script,
    satoshis: u.value,
  }));
  const total = utxos.reduce((s, u) => s + BigInt(u.satoshis), 0n);
  return { utxos, total };
}

export async function escrowBalance(address: string) {
  const { total } = await fetchUtxos(address);
  return { sats: total.toString(), bch: Number(total) / 1e8 };
}

export async function spendTwoOfTwo(opts: {
  address: string;
  pubs: string[];
  wifs: string[];
  dest: string;
}) {
  const pubs = sortedPubs(opts.pubs);
  if (pubs.length !== 2) throw new Error("Need both public keys.");
  const keys = pubs.map((p) => new bitcore.PublicKey(p));
  const wifs = opts.wifs.map((w) => w.trim()).filter(Boolean);
  if (wifs.length < 2) throw new Error("Both parties must sign. Venice does not sign.");
  const { utxos, total } = await fetchUtxos(opts.address);
  if (utxos.length === 0) throw new Error("That 2-of-2 is empty.");
  if (total <= FEE_SATS) throw new Error("Not enough BCH to cover the fee.");
  const send = Number(total - FEE_SATS);
  const priv = wifs.map((w) => new bitcore.PrivateKey(w));
  const tx = new bitcore.Transaction()
    .from(utxos, keys, 2)
    .to(opts.dest.trim(), send)
    .sign(priv);
  const raw = tx.serialize();
  const res = await fetch("https://api.blockchair.com/bitcoin-cash/push/transaction", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ data: raw }),
  });
  const body = (await res.json()) as { data?: { transaction_hash?: string }; context?: { error?: string } };
  const hash = body.data?.transaction_hash;
  if (!hash) throw new Error(body.context?.error ?? "Broadcast failed.");
  return { txid: hash };
}

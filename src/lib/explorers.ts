export const EXPLORERS: Record<
  string,
  { name: string; addressUrl: (addr: string) => string }
> = {
  WART: {
    name: "Wartscan",
    addressUrl: (a) => `https://wartscan.io/account/${encodeURIComponent(a)}`,
  },
  KDA: {
    name: "Kadena explorer",
    addressUrl: (a) =>
      `https://explorer.chainweb.com/mainnet/account/${encodeURIComponent(a)}?token=coin`,
  },
  HNS: {
    name: "Shakeshift",
    addressUrl: (a) => `https://shakeshift.com/address/${encodeURIComponent(a)}`,
  },
  XMR: {
    name: "xmrchain",
    addressUrl: (a) => `https://xmrchain.net/search?value=${encodeURIComponent(a)}`,
  },
  KAS: {
    name: "Kaspa explorer",
    addressUrl: (a) => `https://explorer.kaspa.org/addresses/${encodeURIComponent(a)}`,
  },
  BCH: {
    name: "Blockchair",
    addressUrl: (a) =>
      `https://blockchair.com/bitcoin-cash/address/${encodeURIComponent(a.replace(/^bitcoincash:/, ""))}`,
  },
  NEXA: {
    name: "Nexa explorer",
    addressUrl: (a) => `https://explorer.nexa.org/address/${encodeURIComponent(a)}`,
  },
  ERG: {
    name: "Ergo explorer",
    addressUrl: (a) => `https://explorer.ergoplatform.com/en/addresses/${encodeURIComponent(a)}`,
  },
  ETI: {
    name: "Eticascan",
    addressUrl: (a) => `https://www.eticascan.org/address/${encodeURIComponent(a)}`,
  },
};

export function explorerFor(coin: string, addr: string) {
  const spec = EXPLORERS[coin];
  if (!spec || !addr) return null;
  return { name: spec.name, url: spec.addressUrl(addr) };
}

import { DISCORD_INVITE, TCTC_GRANT } from "@/lib/carbon-config";

export const SITE_URL = "https://venice-51.onrender.com";

export const PITCH_ONE_LINER =
  "Venice 51 — BCH OTC desk for leftover PoW. Public tape. No escrow.";

export const PITCH_DISCORD = `VENICE 51 is live.

A BCH OTC desk for coins the exchanges dropped.
WART · HNS · XMR · KAS · KDA · NEXA · ERG · ETI

No custody. Price in BCH. Both sides stamp, then the print is public.

Door 1 — posting KAS / KDA / NEXA: hold ≥ ${TCTC_GRANT.toLocaleString()} TCTC in that wallet. Automatic.
Door 2 — WART / HNS / XMR and the rest: talk in Discord, desk grant.

${SITE_URL}
${DISCORD_INVITE}`;

export const PITCH_X = `CoinEx is gone. The leftover PoW still needs a desk.

VENICE 51 — BCH OTC. Public prints. No escrow.

${SITE_URL}`;

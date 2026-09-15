# Venice 51

BCH OTC desk swap line. Providing liquidity where it doesn't exist. Watch-only funded wallets, Discord floor. No escrow. No custody.

Live: after Render connects this repo, the service URL is the site.

## Stack

Node, TanStack Start, BCH-quoted books (WART, KDA, HNS, XMR, KAS, BCH, NEXA, ERG, ETI).

## Deploy (same as the Warthog faucet)

1. This GitHub repo.
2. Render Blueprint from `render.yaml` (starter web service, `npm start`).
3. Optional: set `DATABASE_URL` to a Postgres later so tickets survive restarts. Without it the board uses an embedded DB and resets when the box sleeps.

## Local

```
npm install
npm run dev
```

import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import {
  CARBON_SUPPLY_PER_CHAIN,
  CARBON_SUPPLY_TOTAL,
  CARBON_TICKER,
  DISCORD_INVITE,
  DISCORD_NAME,
  KDA_TCTC_DEX,
  KDA_TCTC_MODULE,
  KDA_TCTC_SUPPLY,
} from "@/lib/carbon-config";

export const Route = createFileRoute("/pass")({ component: PassPage });

function PassPage() {
  return (
    <Shell>
      <main className="mx-auto max-w-xl px-4 py-12">
        <p className="font-mono text-xs tracking-[0.22em] text-muted">{CARBON_TICKER}</p>
        <h1 className="mt-3 text-3xl font-medium tracking-tight">TCTC is required. It is free.</h1>
        <p className="mt-3 text-sm text-muted">
          {CARBON_TICKER} — Trillion Capital Trillion Carbon — is the club
          pass. You need it to be on Venice 51. We give it to you. No purchase.
          Join {DISCORD_NAME}, we confirm you are real, then we send 1 TCTC from
          the parent wallet. Holding it is the pass.
        </p>
        <p className="mt-3 font-mono text-xs leading-relaxed text-muted">
          Kadena module {KDA_TCTC_MODULE}. {KDA_TCTC_SUPPLY.toLocaleString()} on
          Kadena. {CARBON_SUPPLY_TOTAL.toLocaleString()} total across Kadena,
          Kaspa, and Nexa ({CARBON_SUPPLY_PER_CHAIN.toLocaleString()} class each).
        </p>
        <ol className="mt-8 list-decimal space-y-3 pl-5 text-sm text-muted">
          <li>Join {DISCORD_NAME} with the invite on this site.</li>
          <li>Talk to the desk. We verify you are a real person.</li>
          <li>Give a Kadena k: address. We send 1 TCTC. Then you can post.</li>
        </ol>
        <img src="/plutus-lockup.png" alt="Plutus" className="mt-8 h-16 w-auto" />
        <p className="mt-2 text-xs text-muted">
          Plutus — Trillion Capital research and development division.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={DISCORD_INVITE} target="_blank" rel="noreferrer">
            <Button type="button">Join {DISCORD_NAME}</Button>
          </a>
          <a href={KDA_TCTC_DEX} target="_blank" rel="noreferrer">
            <Button type="button" variant="outline">
              TCTC on Mercatus
            </Button>
          </a>
          <Link to="/">
            <Button type="button" variant="outline">
              Post a ticket
            </Button>
          </Link>
        </div>
      </main>
    </Shell>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import {
  CARBON_SUPPLY_PER_CHAIN,
  CARBON_SUPPLY_TOTAL,
  CARBON_TICKER,
  DISCORD_INVITE,
  DISCORD_NAME,
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
          Join {DISCORD_NAME}, we confirm you are real, then you get TCTC.
          {CARBON_SUPPLY_TOTAL.toLocaleString()} total,{" "}
          {CARBON_SUPPLY_PER_CHAIN.toLocaleString()} each on Kadena, Kaspa, and
          Nexa. No Google. No X.
        </p>
        <ol className="mt-8 list-decimal space-y-3 pl-5 text-sm text-muted">
          <li>Join {DISCORD_NAME} with the invite on this site.</li>
          <li>Talk to the desk. We verify you are a real person.</li>
          <li>You get TCTC for free. Then you can post and trade.</li>
        </ol>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={DISCORD_INVITE} target="_blank" rel="noreferrer">
            <Button type="button">Join {DISCORD_NAME}</Button>
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

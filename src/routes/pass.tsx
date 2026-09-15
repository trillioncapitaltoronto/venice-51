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
        <h1 className="mt-3 text-3xl font-medium tracking-tight">Registration is TCTC.</h1>
        <p className="mt-3 text-sm text-muted">
          {CARBON_TICKER} is Trillion Capital Trillion Carbon — the membership
          token for Venice 51. {CARBON_SUPPLY_TOTAL.toLocaleString()} total,{" "}
          {CARBON_SUPPLY_PER_CHAIN.toLocaleString()} each on Kadena, Kaspa, and
          Nexa. Hold it on any of those chains. That is how you register. No
          Google. No X. The chatroom is {DISCORD_NAME}.
        </p>
        <ol className="mt-8 list-decimal space-y-3 pl-5 text-sm text-muted">
          <li>Someone in the club refers you. That name goes on the ticket.</li>
          <li>Hold TCTC on Kadena, Kaspa, or Nexa.</li>
          <li>Post. Talk in {DISCORD_NAME}. Dust. Settle. No escrow.</li>
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

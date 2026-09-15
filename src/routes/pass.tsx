import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import {
  CARBON_NAME,
  CARBON_SUPPLY_TOTAL,
  CARBON_TICKER,
  DISCORD_INVITE,
  DISCORD_NAME,
  TCTC_CHAINS,
} from "@/lib/carbon-config";

export const Route = createFileRoute("/pass")({ component: PassPage });

function PassPage() {
  return (
    <Shell>
      <main className="mx-auto max-w-2xl px-4 py-12">
        <p className="font-mono text-xs tracking-[0.22em] text-muted">{CARBON_TICKER}</p>
        <h1 className="mt-3 text-3xl font-medium tracking-tight">
          The token is the grant. It is free.
        </h1>
        <p className="mt-3 text-sm text-muted">
          {CARBON_TICKER} — {CARBON_NAME} — is the club pass. Venice does not
          keep a name list. If the wallet holds ≥ 1 TCTC, you can post and take
          tickets. Join {DISCORD_NAME}, we confirm you are real, then we send 1
          from the parent wallet. No purchase. No Google. No X.
        </p>
        <p className="mt-3 text-sm text-muted">
          {CARBON_SUPPLY_TOTAL.toLocaleString()} across three chains. Kadena,
          Kaspa, and Nexa are live.
        </p>
        <ol className="mt-8 list-decimal space-y-3 pl-5 text-sm text-muted">
          <li>Join {DISCORD_NAME}.</li>
          <li>Talk to the desk. Real person, you’re in.</li>
          <li>Give a Kadena, Kaspa, or Nexa address. We send 1 TCTC from the parent wallet.</li>
          <li>That wallet is the pass. Post a ticket with it.</li>
        </ol>
        <div className="mt-10 space-y-4">
          {TCTC_CHAINS.map((c) => (
            <section key={c.id} className="rounded-xl border border-border bg-card p-5">
              <p className="font-mono text-xs tracking-[0.18em] text-muted">
                {c.ready ? "LIVE" : "WAITING ON TOKEN ID"}
              </p>
              <h2 className="mt-2 text-lg font-medium">
                {c.name} · {c.ticker}
              </h2>
              <dl className="mt-3 space-y-2 font-mono text-xs text-muted">
                <div>
                  <dt className="uppercase tracking-wider">Supply</dt>
                  <dd className="text-foreground">{c.supply.toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wider">Token id</dt>
                  <dd className="break-all text-foreground">
                    {c.tokenId || "Paste the token id and we wire it."}
                  </dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wider">Parent wallet</dt>
                  <dd className="break-all text-foreground">
                    {c.parentWallet || "Send the parent wallet"}
                  </dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wider">DEX</dt>
                  <dd>
                    {c.dexUrl ? (
                      <a
                        href={c.dexUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-flare underline"
                      >
                        {c.dexName}
                      </a>
                    ) : (
                      "Not listed yet"
                    )}
                  </dd>
                </div>
              </dl>
            </section>
          ))}
        </div>
        <img src="/plutus-lockup.png" alt="Plutus" className="mt-8 h-16 w-auto" />
        <p className="mt-2 text-xs text-muted">
          Plutus — Trillion Capital research and development division.
        </p>
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

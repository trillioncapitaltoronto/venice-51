import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Shell } from "@/components/shell";
import { TctcChainPicker } from "@/components/tctc-fields";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import {
  CARBON_NAME,
  CARBON_SUPPLY_TOTAL,
  CARBON_TICKER,
  DISCORD_INVITE,
  DISCORD_NAME,
  TCTC_CHAINS,
  TCTC_GRANT,
  type CarbonChain,
} from "@/lib/carbon-config";
import { TwoDoors } from "@/components/two-doors";
import { checkDeskPass } from "@/lib/pass";

export const Route = createFileRoute("/pass")({ component: PassPage });

function PassPage() {
  return (
    <Shell>
      <main className="mx-auto max-w-2xl px-4 py-12">
        <p className="font-mono text-xs tracking-[0.22em] text-muted">{CARBON_TICKER}</p>
        <h1 className="mt-3 text-3xl font-medium tracking-tight">
          The token is the grant. {TCTC_GRANT.toLocaleString()} TCTC. Free.
        </h1>
        <p className="mt-3 text-sm text-muted">
          {CARBON_TICKER} — {CARBON_NAME} — is door 1. {TCTC_GRANT.toLocaleString()}{" "}
          TCTC, free, on Kadena, Kaspa, or Nexa. Door 2 is the desk key, for
          WART, HNS, XMR and the rest. Either door works. No Google. No X.
        </p>
        <div className="mt-6">
          <TwoDoors />
        </div>
        <p className="mt-3 text-sm text-muted">
          {CARBON_SUPPLY_TOTAL.toLocaleString()} across three chains. All three
          are live.
        </p>
        <ol className="mt-8 list-decimal space-y-3 pl-5 text-sm text-muted">
          <li>Join {DISCORD_NAME}.</li>
          <li>Talk to the desk. Real person, you’re in.</li>
          <li>
            Pick a chain. Give that wallet. We send {TCTC_GRANT.toLocaleString()} TCTC.
          </li>
          <li>Check the pass below. Then post a ticket with the same wallet.</li>
        </ol>
        <VerifyBox />
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
                  <dt className="uppercase tracking-wider">Grant</dt>
                  <dd className="text-foreground">{TCTC_GRANT.toLocaleString()} TCTC per person</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wider">Supply</dt>
                  <dd className="text-foreground">{c.supply.toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wider">Token id</dt>
                  <dd className="break-all text-foreground">{c.tokenId}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wider">Parent wallet</dt>
                  <dd className="break-all text-foreground">
                    {c.parentWallet || "Parent still needed"}
                  </dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wider">{c.dexName || "Explorer"}</dt>
                  <dd>
                    {c.dexUrl ? (
                      <a
                        href={c.dexUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-flare underline"
                      >
                        {c.dexUrl.replace(/^https:\/\//, "")}
                      </a>
                    ) : (
                      "—"
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

function VerifyBox() {
  const [chain, setChain] = useState<CarbonChain>("kda");
  const spec = TCTC_CHAINS.find((c) => c.id === chain);
  const check = useMutation({
    mutationFn: checkDeskPass,
  });
  return (
    <section className="mt-10 rounded-xl border border-border bg-card p-5">
      <h2 className="text-lg font-medium">Check a pass</h2>
      <p className="mt-1 text-sm text-muted">
        Choose the chain you verified on. We read the explorer. ≥{" "}
        {TCTC_GRANT.toLocaleString()} TCTC is the pass.
      </p>
      <form
        className="mt-4 grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          check.mutate({
            data: {
              chain,
              address: String(fd.get("address")).trim(),
            },
          });
        }}
      >
        <TctcChainPicker value={chain} onChange={setChain} name="chain" />
        <div>
          <Label htmlFor="verifyAddress">{`${spec?.name ?? "TCTC"} wallet`}</Label>
          <Input
            id="verifyAddress"
            name="address"
            required
            placeholder={chain === "kda" ? "k:…" : chain === "kas" ? "kaspa:…" : "nexa:…"}
          />
        </div>
        {check.isError ? (
          <p className="text-sm text-sell">
            {check.error instanceof Error ? check.error.message : "Could not check"}
          </p>
        ) : null}
        {check.data ? (
          <p className={check.data.held ? "text-sm text-buy" : "text-sm text-sell"}>
            {check.data.held
              ? `Pass held — ${check.data.balance} TCTC on ${spec?.name}.`
              : check.data.error}
          </p>
        ) : null}
        <Button type="submit" disabled={check.isPending}>
          {check.isPending ? "Checking…" : "Check this wallet"}
        </Button>
      </form>
    </section>
  );
}

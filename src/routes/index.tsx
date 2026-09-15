import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Board } from "@/components/board";
import { OfferForm } from "@/components/offer-form";
import { Shell } from "@/components/shell";
import { TwoDoors } from "@/components/two-doors";
import { PitchBox } from "@/components/pitch-box";
import { TapeStrip } from "@/components/tape-strip";
import { Button } from "@/components/ui/button";
import { DISCORD_INVITE, DISCORD_NAME, TCTC_CHAINS, TCTC_GRANT } from "@/lib/carbon-config";
import { COINS } from "@/lib/coins";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [posting, setPosting] = useState(false);
  return (
    <Shell>
      <section className="relative isolate overflow-hidden">
        <img
          src="/art-hero.jpg"
          alt="Venice 51 — canal, refinery, hangar"
          className="h-96 w-full object-cover object-center brightness-110 contrast-110"
        />
        <div className="hero-wash pointer-events-none absolute inset-0" />
      </section>
      <main className="relative z-10 mx-auto max-w-6xl px-4 py-10">
        <p className="font-mono text-xs tracking-[0.22em] text-flare">SECTOR 51 · LAGUNA</p>
        <h1 className="mt-3 max-w-4xl text-3xl font-medium tracking-tight sm:text-5xl">
          The digital commodity midstream pipeline for upstream miners to sell to downstream consumers.
        </h1>
        <p className="mt-4 max-w-2xl font-mono text-sm tracking-wide text-flare">
          BCH OTC desk swap line. Providing liquidity where it doesn’t exist.
        </p>
        <p className="mt-4 max-w-2xl text-base text-muted">
          Price in BCH. Books look like an exchange — bids left, asks right.
          Two ways onto the floor. Pick the door that matches the coin.
        </p>
        <div className="mt-6 max-w-4xl">
          <TwoDoors />
        </div>
        <div className="mt-8">
          <TapeStrip />
        </div>
        <div className="mt-8 max-w-3xl">
          <PitchBox />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" onClick={() => setPosting((v) => !v)}>
            {posting ? "Hide ticket form" : "Post a ticket"}
          </Button>
          <a href={DISCORD_INVITE} target="_blank" rel="noreferrer">
            <Button type="button" variant="outline">
              Join {DISCORD_NAME}
            </Button>
          </a>
          <Link to="/guide">
            <Button type="button" variant="outline">
              How the desk works
            </Button>
          </Link>
        </div>
        <p className="mt-6 max-w-2xl text-sm text-muted">
          Want to help make Venice 51 better? Volunteers are welcome — code,
          explorers, honesty in the room. Join Discord and say so.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <img src="/plutus-lockup.png" alt="Plutus" className="h-16 w-auto" />
          <p className="max-w-sm text-xs text-muted">
            Built by Plutus — Trillion Capital research and development
            division.
          </p>
        </div>
        <div className="mt-8 overflow-hidden border-y border-border py-3">
          <div className="flex gap-6 font-mono text-xs text-muted">
            {COINS.map((c) => (
              <span key={c.ticker} className="shrink-0">
                {c.ticker}
                <span className="ml-2 text-foreground/50">{c.name}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {TCTC_CHAINS.map((c) => (
            <div key={c.id} className="rounded-xl border border-border bg-card px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
                TCTC · {c.name} · {TCTC_GRANT.toLocaleString()} grant
              </p>
              <p className="mt-1 font-mono text-xs break-all">
                {c.tokenId || "token id coming"}
              </p>
              {c.parentWallet ? (
                <p className="mt-1 font-mono text-[10px] break-all text-muted">{c.parentWallet}</p>
              ) : null}
              {c.dexUrl ? (
                <a
                  href={c.dexUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-xs text-flare underline"
                >
                  {c.dexName}
                </a>
              ) : (
                <p className="mt-2 text-xs text-muted">Waiting on id</p>
              )}
            </div>
          ))}
        </div>
        {posting ? (
          <section className="mt-8 rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-medium">New ticket</h2>
            <p className="mb-4 text-sm text-muted">
              I am selling or I am buying. Coin, size, BCH price, Discord,
              wallet we watch.
            </p>
            <OfferForm onDone={() => setPosting(false)} />
          </section>
        ) : null}
        <section className="mt-10">
          <Board />
        </section>
      </main>
    </Shell>
  );
}

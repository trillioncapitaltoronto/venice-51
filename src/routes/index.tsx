import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Board } from "@/components/board";
import { OfferForm } from "@/components/offer-form";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { DISCORD_INVITE, DISCORD_NAME } from "@/lib/carbon-config";
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
        <h1 className="mt-3 max-w-3xl text-4xl font-medium tracking-tight sm:text-5xl">
          A public floor for leftover PoW.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted">
          Price in BCH. Books look like an exchange — bids left, asks right.
          Agree in Discord. Buyer sends BCH. Referral happens in the room, not
          on this site.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" onClick={() => setPosting((v) => !v)}>
            {posting ? "Close ticket form" : "Post a ticket"}
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
        {posting ? (
          <section className="mt-8 rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-medium">New ticket</h2>
            <p className="mb-4 text-sm text-muted">
              Coin, size, BCH ask, Discord, wallet to watch.
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

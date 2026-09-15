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
  return (
    <Shell>
      <section className="relative isolate overflow-hidden">
        <img
          src="/art-hero.jpg"
          alt="Venice 51 — canal, refinery, hangar"
          className="h-72 w-full object-cover object-center brightness-110 contrast-110 sm:h-96"
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
        <div className="mt-6 flex flex-wrap gap-3">
          <a href={DISCORD_INVITE} target="_blank" rel="noreferrer">
            <Button type="button" variant="outline">
              Join {DISCORD_NAME}
            </Button>
          </a>
          <Link to="/tape">
            <Button type="button" variant="outline">
              Tape
            </Button>
          </Link>
          <Link to="/guide">
            <Button type="button" variant="outline">
              How the desk works
            </Button>
          </Link>
        </div>
        <section className="mt-8 rounded-xl border border-border bg-card p-5">
          <h2 className="text-lg font-medium">Post a bid or an ask</h2>
          <p className="mb-4 text-sm text-muted">
            I am buying or I am selling. Coin, size, BCH price, Discord, wallet.
          </p>
          <OfferForm />
        </section>
        <section className="mt-10">
          <Board />
        </section>
        <div className="mt-10 max-w-4xl">
          <TwoDoors />
        </div>
        <div className="mt-8">
          <TapeStrip />
        </div>
        <div className="mt-8 max-w-3xl">
          <PitchBox />
        </div>
        <p className="mt-8 max-w-2xl text-sm text-muted">
          Volunteers welcome — code, explorers, honesty in the room.
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
      </main>
    </Shell>
  );
}

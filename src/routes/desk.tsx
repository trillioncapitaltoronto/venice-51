import { createFileRoute, Link } from "@tanstack/react-router";
import { DISCORD_INVITE, DISCORD_NAME, TCTC_CHAINS, TCTC_GRANT } from "@/lib/carbon-config";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/desk")({ component: DeskPage });

function DeskPage() {
  return (
    <Shell>
      <main className="mx-auto max-w-xl px-4 py-12">
        <p className="font-mono text-xs tracking-[0.22em] text-muted">THE CLUB</p>
        <h1 className="mt-3 text-3xl font-medium tracking-tight">
          TCTC is the key. There is no desk password.
        </h1>
        <p className="mt-3 text-sm text-muted">
          Discord is where we meet. The token is what opens the board. You pick
          Kadena, Kaspa, or Nexa. After we talk, we send{" "}
          {TCTC_GRANT.toLocaleString()} TCTC to that wallet. Venice reads the
          chain. Hold the grant → you post. Lose it → you’re off the desk. No
          secret, no name list, no Google.
        </p>
        <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm text-muted">
          <li>Join {DISCORD_NAME}.</li>
          <li>Talk to the desk. We confirm you are real.</li>
          <li>Pick a chain. Give that address. You get {TCTC_GRANT.toLocaleString()} TCTC.</li>
          <li>Post with that same wallet. Buyer sends BCH in the room.</li>
        </ol>
        <div className="mt-8 space-y-3">
          {TCTC_CHAINS.map((c) => (
            <section key={c.id} className="rounded-xl border border-border bg-card p-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
                {c.name} · {TCTC_GRANT.toLocaleString()} TCTC grant
              </p>
              <p className="mt-2 break-all font-mono text-xs">{c.tokenId}</p>
              {c.parentWallet ? (
                <p className="mt-2 break-all font-mono text-[10px] text-muted">
                  Parent {c.parentWallet}
                </p>
              ) : (
                <p className="mt-2 text-xs text-muted">Parent k: still to post</p>
              )}
              {c.dexUrl ? (
                <a
                  href={c.dexUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-xs text-flare underline"
                >
                  {c.dexName}
                </a>
              ) : null}
            </section>
          ))}
        </div>
        <section className="mt-8 rounded-xl border border-border bg-card p-5">
          <img src="/plutus-lockup.png" alt="Plutus" className="h-16 w-auto" />
          <p className="mt-3 text-sm text-muted">
            Plutus — Trillion Capital research and development division. This
            desk is theirs.
          </p>
        </section>
        <section className="mt-8 rounded-xl border border-border bg-card p-5">
          <h2 className="text-lg font-medium">Volunteers welcome</h2>
          <p className="mt-2 text-sm text-muted">
            This desk is new. If you can write, design, check explorers, keep
            the room honest, or just care about leftover PoW — come help make
            it better. No résumé. Show up in Discord and say you want to work.
          </p>
        </section>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={DISCORD_INVITE} target="_blank" rel="noreferrer">
            <Button type="button">Join {DISCORD_NAME}</Button>
          </a>
          <Link to="/pass">
            <Button type="button" variant="outline">
              Check a TCTC pass
            </Button>
          </Link>
          <Link to="/">
            <Button type="button" variant="outline">
              Board
            </Button>
          </Link>
        </div>
      </main>
    </Shell>
  );
}

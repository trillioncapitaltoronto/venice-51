import { createFileRoute, Link } from "@tanstack/react-router";
import { DISCORD_INVITE, DISCORD_NAME } from "@/lib/carbon-config";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/desk")({ component: DeskKey });

function DeskKey() {
  return (
    <Shell>
      <main className="mx-auto max-w-xl px-4 py-12">
        <p className="font-mono text-xs tracking-[0.22em] text-muted">THE CLUB</p>
        <h1 className="mt-3 text-3xl font-medium tracking-tight">Join the room. We verify you there.</h1>
        <p className="mt-3 text-sm text-muted">
          Click the invite. Walk in. We talk to you, make sure you are a real
          person, then you are in. Referral is that conversation — not a form
          on this site. The board is just the books.
        </p>
        <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm text-muted">
          <li>Join {DISCORD_NAME} with the invite on this page.</li>
          <li>Talk to the desk. We confirm you are real.</li>
          <li>Trade in the room. Price in BCH. Buyer sends BCH.</li>
        </ol>
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

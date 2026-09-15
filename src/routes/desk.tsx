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
        <h1 className="mt-3 text-3xl font-medium tracking-tight">The door is Discord.</h1>
        <p className="mt-3 text-sm text-muted">
          Referral lives in {DISCORD_NAME}, not on this site. Someone in the
          room brings you in. The board is just the books. Price in BCH, agree
          in the room, buyer sends BCH.
        </p>
        <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm text-muted">
          <li>Get referred in {DISCORD_NAME}.</li>
          <li>Post a ticket on the board if you want.</li>
          <li>Paste the ticket in the room. Witnesses see the sale.</li>
          <li>Buyer sends BCH. Seller sends the coin.</li>
        </ol>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={DISCORD_INVITE} target="_blank" rel="noreferrer">
            <Button type="button">Open {DISCORD_NAME}</Button>
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

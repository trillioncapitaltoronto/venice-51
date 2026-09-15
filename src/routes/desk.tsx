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
        <h1 className="mt-3 text-3xl font-medium tracking-tight">Referral is the door.</h1>
        <p className="mt-3 text-sm text-muted">
          You do not join by filling a form. Someone already in the chain posts
          your name, then they confirm you are solid. Their reputation is on the
          line for you. That chain is what binds the club. Scam us and you burn
          the person who vouched — and everyone above them.
        </p>
        <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm text-muted">
          <li>A vouched member refers you — their Discord on your ticket.</li>
          <li>They confirm here: “I vouch. My name is on this person.”</li>
          <li>Now you can refer the next person. The chain grows.</li>
          <li>Price in BCH, agree in {DISCORD_NAME}, buyer sends BCH.</li>
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

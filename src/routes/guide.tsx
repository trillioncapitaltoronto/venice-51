import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { DISCORD_NAME } from "@/lib/carbon-config";

export const Route = createFileRoute("/guide")({ component: Guide });

function Guide() {
  return (
    <Shell>
      <main className="mx-auto max-w-2xl px-4 py-12">
        <p className="font-mono text-xs tracking-[0.22em] text-muted">DESK RULES</p>
        <h1 className="mt-3 text-4xl font-medium tracking-tight">A club, not an escrow.</h1>
        <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted">
          <section>
            <h2 className="mb-2 text-foreground">What this is</h2>
            <p>
              Venice 51 is a public floor for leftover PoW, quoted Coin / BCH.
              Referral is a Discord thing — someone in {DISCORD_NAME} brings you
              in. The website is the books. There is no escrow. Honesty is
              paramount. A thief hates a room that saw the sale.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-foreground">Why BCH</h2>
            <p>
              Every ticket is Coin / BCH — commodity to commodity. 2,500 WART at
              0.000076 BCH is the quote. There is no dollar book. Pesos, CAD,
              whatever you think in, you translate off-desk. BCH is liquid, on
              every on-ramp, and cheap to move, so a Warthog holder and a Kaspa
              holder still share one unit. The board number is the ask. The
              print you actually trade is whatever you agree in Discord.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-foreground">TCTC is registration</h2>
            <p>
              Trillion Capital Trillion Carbon. Three million tokens — one
              million each on Kadena, Kaspa, and Nexa. Hold it, you are on the
              exchange. No Google. No X. The desk checks the chain when you post.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-foreground">Discord is the floor</h2>
            <p>
              Click a ticket, copy V51-n, open {DISCORD_NAME}, ping the name on
              the ticket. Barter. Agree. Dust both ways on the native chain.
              Pay in BCH, or split, or use escrow you both picked. The desk
              never holds the coins.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-foreground">Trust — we are not the wallet</h2>
            <p>
              Absolute trust does not come from Venice holding the bag. A desk
              that takes everyone’s WART and BCH is a honeypot: one hack, one
              insider, one regulator, and the venue is dead. We do not take
              custody.
            </p>
            <p className="mt-3">
              Trust is expensive to fake. Today that means: TCTC registration,
              a public ticket (V51-n), a Discord name the room can see, and dust
              before size. A scammer hates a public trail more than they hate a
              Terms of Service page.
            </p>
            <p className="mt-3">
              No escrow. Optional nothing. Payer and payee meet in the room
              because someone referred them. Venice has no key and will not
              co-sign, refund, or referee.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-foreground">What grows later</h2>
            <p>
              Optional TCTC bond on a ticket. Per-chain dust helpers. We add
              rungs, we do not rebuild the ladder.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-foreground">Scores</h2>
            <p>
              Discord names carry a fill count — how many tickets that name
              closed in public. Venice does not buy anyone out. The chain and
              the room are the consequence.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-foreground">How not to get wrecked</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Prefer on-chain. Test a dust transfer first.</li>
              <li>Do not send first to a stranger.</li>
              <li>Ignore anyone who asks you to “verify” on a cloned site.</li>
              <li>This is not legal, tax, or investment advice.</li>
            </ul>
          </section>
        </div>
      </main>
    </Shell>
  );
}

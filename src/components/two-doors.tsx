import { Link } from "@tanstack/react-router";
import { DISCORD_NAME, TCTC_GRANT } from "@/lib/carbon-config";

export function TwoDoors() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <article className="rounded-xl border border-flare/40 bg-card p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-flare">Door 1 · token</p>
        <h2 className="mt-2 text-lg font-medium">KAS · KDA · NEXA</h2>
        <p className="mt-2 text-sm text-muted">
          Post from a wallet that holds ≥ {TCTC_GRANT.toLocaleString()} TCTC on
          that chain. Venice reads the explorer. You’re on the desk
          automatically. No desk password.
        </p>
        <Link to="/pass" className="mt-3 inline-block text-sm text-flare underline">
          Check a TCTC pass
        </Link>
      </article>
      <article className="rounded-xl border border-border bg-card p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Door 2 · desk key</p>
        <h2 className="mt-2 text-lg font-medium">WART · HNS · XMR · ERG · ETI · BCH</h2>
        <p className="mt-2 text-sm text-muted">
          These coins are not on the TCTC chains. Join {DISCORD_NAME}. We talk.
          Then the desk grants your Discord name with the key. You post without
          TCTC.
        </p>
        <Link to="/desk" className="mt-3 inline-block text-sm text-flare underline">
          Club / desk grant
        </Link>
      </article>
    </div>
  );
}

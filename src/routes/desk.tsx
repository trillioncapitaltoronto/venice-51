import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DISCORD_INVITE, DISCORD_NAME, TCTC_CHAINS, TCTC_GRANT } from "@/lib/carbon-config";
import { grantPoster, listPosters, revokePoster } from "@/lib/desk";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

export const Route = createFileRoute("/desk")({ component: DeskPage });

function DeskPage() {
  const posters = useQuery({ queryKey: ["posters"], queryFn: () => listPosters() });
  return (
    <Shell>
      <main className="mx-auto max-w-xl px-4 py-12">
        <p className="font-mono text-xs tracking-[0.22em] text-muted">THE CLUB</p>
        <h1 className="mt-3 text-3xl font-medium tracking-tight">Two doors. Same floor.</h1>
        <p className="mt-3 text-sm text-muted">
          Door 1 is the token. They pick Kadena, Kaspa, or Nexa. After we talk
          in Discord we send {TCTC_GRANT.toLocaleString()} TCTC to that wallet.
          Venice reads the chain. That’s the key — coins, not a password.
        </p>
        <p className="mt-3 text-sm text-muted">
          Door 2 is a desk grant. For people who are not on those three
          wallets. Same Discord talk. You type their name with the desk key.
          They can post without TCTC.
        </p>
        <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm text-muted">
          <li>Join {DISCORD_NAME}.</li>
          <li>Talk to the desk. Real person.</li>
          <li>
            Token door: pick a chain, get {TCTC_GRANT.toLocaleString()} TCTC.
            Other door: desk grant on their Discord name.
          </li>
          <li>Post. Buyer sends BCH in the room.</li>
        </ol>
        <div className="mt-8 space-y-3">
          {TCTC_CHAINS.map((c) => (
            <section key={c.id} className="rounded-xl border border-border bg-card p-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
                Door 1 · {c.name} · {TCTC_GRANT.toLocaleString()} TCTC
              </p>
              <p className="mt-2 break-all font-mono text-xs">{c.tokenId}</p>
              <p className="mt-2 break-all font-mono text-[10px] text-muted">
                Parent {c.parentWallet || "—"}
              </p>
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
          <h2 className="text-lg font-medium">Door 2 — desk granted</h2>
          <p className="mt-2 text-sm text-muted">
            Names you let in without TCTC. Same one-time grant as before.
          </p>
          <ul className="mt-3 space-y-1 font-mono text-sm">
            {(posters.data ?? []).length === 0 ? (
              <li className="text-muted">Nobody on this door yet.</li>
            ) : (
              (posters.data ?? []).map((p) => <li key={p.discord}>@{p.discord}</li>)
            )}
          </ul>
        </section>
        <GrantBox />
        <section className="mt-8 rounded-xl border border-border bg-card p-5">
          <img src="/plutus-lockup.png" alt="Plutus" className="h-16 w-auto" />
          <p className="mt-3 text-sm text-muted">
            Plutus — Trillion Capital research and development division.
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

function GrantBox() {
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const grant = useMutation({
    mutationFn: grantPoster,
    onSuccess: (res) => {
      setOk(`Granted @${res.discord}`);
      setError(null);
      void qc.invalidateQueries({ queryKey: ["posters"] });
    },
    onError: (e: Error) => {
      setOk(null);
      setError(e.message);
    },
  });
  const revoke = useMutation({
    mutationFn: revokePoster,
    onSuccess: () => {
      setOk("Revoked.");
      setError(null);
      void qc.invalidateQueries({ queryKey: ["posters"] });
    },
    onError: (e: Error) => {
      setOk(null);
      setError(e.message);
    },
  });
  return (
    <form
      className="mt-8 rounded-xl border border-border bg-card p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const deskKey = String(fd.get("deskKey"));
        const discord = String(fd.get("discord"));
        const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
        const action = submitter?.value || "grant";
        if (action === "revoke") revoke.mutate({ data: { deskKey, discord } });
        else grant.mutate({ data: { deskKey, discord } });
      }}
    >
      <h2 className="text-lg font-medium">Grant the other door</h2>
      <p className="mt-1 text-sm text-muted">
        After Discord. For someone not using TCTC. Once.
      </p>
      <div className="mt-3">
        <Label htmlFor="deskKey">Desk key</Label>
        <Input id="deskKey" name="deskKey" type="password" required autoComplete="off" />
      </div>
      <div className="mt-3">
        <Label htmlFor="grantDiscord">Their Discord name</Label>
        <Input id="grantDiscord" name="discord" required placeholder="username" />
      </div>
      {error ? <p className="mt-2 text-sm text-sell">{error}</p> : null}
      {ok ? <p className="mt-2 text-sm text-buy">{ok}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="submit" name="action" value="grant" disabled={grant.isPending}>
          {grant.isPending ? "Granting…" : "Grant"}
        </Button>
        <Button
          type="submit"
          name="action"
          value="revoke"
          variant="outline"
          disabled={revoke.isPending}
        >
          Revoke
        </Button>
      </div>
    </form>
  );
}

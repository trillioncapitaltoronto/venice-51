import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DISCORD_INVITE, DISCORD_NAME } from "@/lib/carbon-config";
import { grantPoster, listPosters, revokePoster } from "@/lib/desk";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

export const Route = createFileRoute("/desk")({ component: DeskKey });

function DeskKey() {
  const posters = useQuery({ queryKey: ["posters"], queryFn: () => listPosters() });
  return (
    <Shell>
      <main className="mx-auto max-w-xl px-4 py-12">
        <p className="font-mono text-xs tracking-[0.22em] text-muted">THE CLUB</p>
        <h1 className="mt-3 text-3xl font-medium tracking-tight">Join the room. We verify you there.</h1>
        <p className="mt-3 text-sm text-muted">
          Click the invite. Walk in. We talk to you, make sure you are a real
          person. Then we send 1 TCTC from the parent wallet to your Kadena
          k: or Kaspa address. That token is the grant. Holding ≥ 1 TCTC lets
          you post and take tickets. Nexa follows when that id is on the pass
          page.
        </p>
        <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm text-muted">
          <li>Join {DISCORD_NAME} with the invite on this page.</li>
          <li>Talk to the desk. We confirm you are real.</li>
          <li>Give a Kadena k: or Kaspa address. You get 1 TCTC for free.</li>
          <li>Trade in the room. Price in BCH. Buyer sends BCH.</li>
        </ol>
        <section className="mt-8 rounded-xl border border-border bg-card p-5">
          <h2 className="text-lg font-medium">Approved members</h2>
          <p className="mt-2 text-sm text-muted">
            Legacy name list. The live grant is TCTC on-chain. Kadena first.
          </p>
          <ul className="mt-3 space-y-1 font-mono text-sm">
            {(posters.data ?? []).length === 0 ? (
              <li className="text-muted">No approved members yet.</li>
            ) : (
              (posters.data ?? []).map((p) => <li key={p.discord}>@{p.discord}</li>)
            )}
          </ul>
        </section>
        <GrantBox />
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
      <h2 className="text-lg font-medium">Desk override</h2>
      <p className="mt-1 text-sm text-muted">
        Only if the chain check is down. Normal path: send them 1 TCTC.
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
          {grant.isPending ? "Granting…" : "Grant post"}
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

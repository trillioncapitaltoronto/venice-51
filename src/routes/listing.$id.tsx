import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { coinName } from "@/lib/coins";
import { DISCORD_INVITE, DISCORD_NAME } from "@/lib/carbon-config";
import { discordOpener, ticketCode } from "@/lib/handshake";
import { explorerFor } from "@/lib/explorers";
import { openEscrow, escrowForListing } from "@/lib/escrow";
import { getListing, type PublicListing } from "@/lib/listings";
import { markFilled } from "@/lib/trust";
import { listTakes, postTake } from "@/lib/takes";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/listing/$id")({ component: ListingPage });

function ListingPage() {
  const { id } = Route.useParams();
  const listingId = Number(id);
  const qc = useQueryClient();
  const listing = useQuery({
    queryKey: ["listing", listingId],
    queryFn: () => getListing({ data: { id: listingId } }),
    refetchInterval: 20_000,
  });
  const row = listing.data;
  if (listing.isLoading) {
    return (
      <Shell>
        <main className="mx-auto max-w-2xl px-4 py-16">
          <div className="h-40 animate-pulse rounded-xl bg-card" />
        </main>
      </Shell>
    );
  }
  if (!row) {
    return (
      <Shell>
        <main className="mx-auto max-w-2xl px-4 py-16">
          <p className="text-muted">Ticket not found.</p>
          <Link to="/" className="mt-4 inline-block text-sm">
            Back to the board
          </Link>
        </main>
      </Shell>
    );
  }
  const code = ticketCode(row.id);
  return (
    <Shell>
      <main className="mx-auto max-w-2xl px-4 py-12">
        <Link to="/" className="text-sm text-muted hover:text-foreground">
          Board
        </Link>
        <div className="mt-6 rounded-xl border border-border bg-card p-5">
          <p className="font-mono text-xs tracking-[0.18em] text-muted">{code}</p>
          <span
            className={cn(
              "mt-3 inline-block rounded-md px-2 py-1 font-mono text-xs uppercase",
              row.side === "buy" ? "bg-buy/15 text-buy" : "bg-sell/15 text-sell",
            )}
          >
            {row.side === "buy" ? "Bid" : "Offer"} · {row.status}
          </span>
          {row.funded ? (
            <span className="ml-2 rounded-md border border-buy/40 px-2 py-1 font-mono text-xs uppercase text-buy">
              Funded
            </span>
          ) : null}
          <h1 className="mt-4 text-3xl font-medium tracking-tight">
            {row.amount} {row.coin}
          </h1>
          <p className="text-sm text-muted">{coinName(row.coin)}</p>
          <p className="mt-4 font-mono text-lg tabular-nums">
            {row.price} BCH
            <span className="ml-2 text-sm text-muted">per coin</span>
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted">{DISCORD_NAME}</dt>
              <dd className="font-mono">
                {row.discord} · {row.fills} fill{row.fills === 1 ? "" : "s"}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-muted">{row.notes || "No note."}</p>
        </div>
        <WalletTrack row={row} onRefresh={() => qc.invalidateQueries({ queryKey: ["listing", listingId] })} />
        <TakeBox row={row} />
        <section className="mt-6 rounded-xl border border-border bg-card p-5">
          <h2 className="text-lg font-medium">Do it in public</h2>
          <p className="mt-1 text-sm text-muted">
            Agree the print in {DISCORD_NAME}. Default: buyer sends BCH, seller
            sends the coin, witnesses in the room. Optional: lock the BCH in a
            2-of-2. Venice has no key and will not co-sign.
          </p>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted">
            <li>Paste {code} in the room so people see the sale.</li>
            <li>Agree the BCH number in that thread.</li>
            <li>Buyer sends BCH. Seller sends the coin.</li>
            <li>Mark the fill. Honesty is the whole system.</li>
          </ol>
          <div className="mt-5 flex flex-wrap gap-3">
            <CopyLine text={discordOpener(row)} />
            <a href={DISCORD_INVITE} target="_blank" rel="noreferrer">
              <Button type="button">Open {DISCORD_NAME}</Button>
            </a>
            <LockBch listingId={listingId} />
          </div>
        </section>
        <TrustBox listingId={listingId} open={row.status === "open"} onChange={() => qc.invalidateQueries()} />
      </main>
    </Shell>
  );
}

function TakeBox({ row }: { row: PublicListing }) {
  const qc = useQueryClient();
  const takes = useQuery({
    queryKey: ["takes", row.id],
    queryFn: () => listTakes({ data: { listingId: row.id } }),
  });
  const take = useMutation({
    mutationFn: postTake,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["takes", row.id] }),
  });
  if (row.status !== "open") return null;
  const verb = row.side === "sell" ? "Buy this offer" : "Sell into this bid";
  return (
    <section className="mt-6 rounded-xl border border-border bg-card p-5">
      <h2 className="text-lg font-medium">{verb}</h2>
      <p className="mt-1 text-sm text-muted">
        You are the other side of this ticket. Desk must have granted your
        Discord name. Then you talk in the room or lock BCH in a 2-of-2.
      </p>
      <form
        className="mt-4 grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          take.mutate({
            data: {
              listingId: row.id,
              discord: String(fd.get("discord")),
              wallet: String(fd.get("wallet")),
              notes: String(fd.get("notes") ?? ""),
            },
          });
        }}
      >
        <div>
          <Label htmlFor="takeDiscord">{`${DISCORD_NAME} username`}</Label>
          <Input id="takeDiscord" name="discord" required placeholder="username" />
        </div>
        <div>
          <Label htmlFor="takeWallet">Your public wallet</Label>
          <Input id="takeWallet" name="wallet" required placeholder="public address" />
        </div>
        <div>
          <Label htmlFor="takeNotes">Note</Label>
          <Input id="takeNotes" name="notes" placeholder="size you want, chain, whatever" />
        </div>
        {take.isError ? (
          <p className="text-sm text-sell">
            {take.error instanceof Error ? take.error.message : "Could not post"}
          </p>
        ) : null}
        {take.isSuccess ? <p className="text-sm text-buy">You’re on this ticket.</p> : null}
        <Button type="submit" disabled={take.isPending}>
          {take.isPending ? "Posting…" : verb}
        </Button>
      </form>
      <ul className="mt-5 space-y-2">
        {(takes.data ?? []).length === 0 ? (
          <li className="text-sm text-muted">Nobody has taken this yet.</li>
        ) : (
          (takes.data ?? []).map((t) => (
            <li key={t.id} className="rounded-md border border-border px-3 py-2 text-sm">
              <span className="font-mono">@{t.discord}</span>
              <span className="ml-2 break-all font-mono text-xs text-muted">{t.wallet}</span>
              {t.notes ? <p className="mt-1 text-muted">{t.notes}</p> : null}
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

function LockBch({ listingId }: { listingId: number }) {
  const nav = useNavigate();
  const existing = useQuery({
    queryKey: ["escrow-for", listingId],
    queryFn: () => escrowForListing({ data: { listingId } }),
  });
  const open = useMutation({
    mutationFn: () => openEscrow({ data: { listingId } }),
    onSuccess: (res) => {
      void nav({ to: "/escrow/$id", params: { id: String(res.id) } });
    },
  });
  if (existing.data?.id) {
    return (
      <Link to="/escrow/$id" params={{ id: String(existing.data.id) }}>
        <Button type="button">Open the 2-of-2</Button>
      </Link>
    );
  }
  return (
    <Button type="button" variant="outline" disabled={open.isPending} onClick={() => open.mutate()}>
      {open.isPending ? "Opening…" : "Lock BCH in a 2-of-2"}
    </Button>
  );
}

function WalletTrack({ row, onRefresh }: { row: PublicListing; onRefresh: () => void }) {
  const explorer = explorerFor(row.coin, row.wallet);
  return (
    <section className="mt-6 rounded-xl border border-border bg-card p-5">
      <h2 className="text-lg font-medium">On-chain wallet</h2>
      <p className="mt-1 text-sm text-muted">
        We watch this address on the {row.coin} explorer. Not volunteer work —
        the desk pulls the live balance.
      </p>
      <p className="mt-3 break-all font-mono text-xs">{row.wallet || "No wallet posted."}</p>
      <p className="mt-3 font-mono text-2xl tabular-nums">
        {row.walletBalance || "—"} {row.coin}
      </p>
      <p className="text-sm text-muted">
        Ticket size {row.amount} {row.coin}
        {row.funded ? " · funded" : " · not funded"}
      </p>
      {row.walletError ? <p className="mt-2 text-sm text-sell">{row.walletError}</p> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={onRefresh}>
          Recheck balance
        </Button>
        {explorer ? (
          <a href={explorer.url} target="_blank" rel="noreferrer">
            <Button type="button">Open {explorer.name}</Button>
          </a>
        ) : null}
      </div>
      {explorer ? (
        <iframe
          title={`${row.coin} explorer`}
          src={explorer.url}
          className="mt-4 h-80 w-full rounded-md border border-border bg-background"
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      ) : null}
    </section>
  );
}

function CopyLine({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => {
          setDone(true);
          window.setTimeout(() => setDone(false), 1200);
        });
      }}
    >
      {done ? "Copied!" : "Copy Discord opener"}
    </Button>
  );
}

function TrustBox({
  listingId,
  open,
  onChange,
}: {
  listingId: number;
  open: boolean;
  onChange: () => void;
}) {
  const fill = useMutation({
    mutationFn: markFilled,
    onSuccess: onChange,
  });
  if (!open) return null;
  return (
    <form
      className="mt-6 rounded-xl border border-border bg-card p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        fill.mutate({
          data: { listingId, counterparty: String(fd.get("counterparty")) },
        });
      }}
    >
      <h2 className="text-lg font-medium">Mark filled</h2>
      <p className="mt-1 text-sm text-muted">
        Both Discord names get a public fill. Venice does not pay anyone.
      </p>
      <div className="mt-3">
        <Label htmlFor="counterparty">Other Discord name</Label>
        <Input id="counterparty" name="counterparty" required placeholder="username" />
      </div>
      {fill.isError ? (
        <p className="mt-2 text-sm text-sell">
          {fill.error instanceof Error ? fill.error.message : "Could not fill"}
        </p>
      ) : null}
      <Button type="submit" className="mt-3" disabled={fill.isPending}>
        {fill.isPending ? "Saving…" : "Add a fill"}
      </Button>
    </form>
  );
}


import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { coinName } from "@/lib/coins";
import { DISCORD_INVITE, DISCORD_NAME } from "@/lib/carbon-config";
import { discordOpener, ticketCode } from "@/lib/handshake";
import { confirmVouch, vouchChain } from "@/lib/club";
import { getListing } from "@/lib/listings";
import { markFilled } from "@/lib/trust";
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
          {row.vouched ? (
            <span className="ml-2 rounded-md border border-buy/40 px-2 py-1 font-mono text-xs uppercase text-buy">
              Vouched
            </span>
          ) : (
            <span className="ml-2 rounded-md border border-sell/40 px-2 py-1 font-mono text-xs uppercase text-sell">
              Waiting on vouch
            </span>
          )}
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
              <dt className="text-xs uppercase tracking-wider text-muted">Watch wallet</dt>
              <dd className="break-all font-mono text-xs">
                {row.wallet || "—"}
                {row.walletBalance ? ` · ${row.walletBalance} ${row.coin}` : ""}
                {row.funded ? " · verified" : ""}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted">{DISCORD_NAME}</dt>
              <dd className="font-mono">
                {row.discord} · {row.fills} fill{row.fills === 1 ? "" : "s"}
                {row.referredBy ? ` · via ${row.referredBy}` : ""}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-muted">{row.notes || "No note."}</p>
        </div>
        <section className="mt-6 rounded-xl border border-border bg-card p-5">
          <h2 className="text-lg font-medium">Do it in public</h2>
          <p className="mt-1 text-sm text-muted">
            Agree the print in {DISCORD_NAME}. Buyer sends BCH. Seller sends the
            coin. Witnesses in the room. No keys, no escrow.
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
          </div>
        </section>
        <TrustBox listingId={listingId} open={row.status === "open"} onChange={() => qc.invalidateQueries()} />
        <VouchBox
          listingId={listingId}
          referredBy={row.referredBy}
          discord={row.discord}
          vouched={row.vouched}
          onChange={() => qc.invalidateQueries()}
        />
      </main>
    </Shell>
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

function VouchBox({
  listingId,
  referredBy,
  discord,
  vouched,
  onChange,
}: {
  listingId: number;
  referredBy: string;
  discord: string;
  vouched: boolean;
  onChange: () => void;
}) {
  const chain = useQuery({
    queryKey: ["chain", discord],
    queryFn: () => vouchChain({ data: { discord } }),
    enabled: Boolean(discord),
  });
  const mut = useMutation({
    mutationFn: confirmVouch,
    onSuccess: onChange,
  });
  return (
    <section className="mt-6 rounded-xl border border-border bg-card p-5">
      <h2 className="text-lg font-medium">The chain</h2>
      <p className="mt-1 text-sm text-muted">
        Someone’s name is on the line for {discord}. That is the only door.
        {chain.data && chain.data.length > 0
          ? ` Lineage: ${chain.data.join(" ← ")}.`
          : ""}
      </p>
      {vouched ? (
        <p className="mt-3 text-sm text-buy">Vouched by {referredBy}.</p>
      ) : (
        <form
          className="mt-4 grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            mut.mutate({
              data: { listingId, referrer: String(fd.get("referrer")) },
            });
          }}
        >
          <p className="text-sm text-muted">
            Only @{referredBy} can confirm this person is solid. Type that name.
          </p>
          <div>
            <Label htmlFor="referrer">I am the referrer</Label>
            <Input id="referrer" name="referrer" required defaultValue={referredBy} />
          </div>
          {mut.isError ? (
            <p className="text-sm text-sell">
              {mut.error instanceof Error ? mut.error.message : "Could not vouch"}
            </p>
          ) : null}
          <Button type="submit" disabled={mut.isPending}>
            {mut.isPending ? "Vouching…" : `I vouch. My name is on ${discord}.`}
          </Button>
        </form>
      )}
    </section>
  );
}

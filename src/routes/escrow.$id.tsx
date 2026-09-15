import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { newBchKey } from "@/lib/bch-keys";
import { addEscrowKey, getEscrow, getEscrowBalance, spendEscrow } from "@/lib/escrow";
import { getListing } from "@/lib/listings";
import { ticketCode } from "@/lib/handshake";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

export const Route = createFileRoute("/escrow/$id")({ component: EscrowPage });

function EscrowPage() {
  const { id } = Route.useParams();
  const escrowId = Number(id);
  const qc = useQueryClient();
  const escrow = useQuery({
    queryKey: ["escrow", escrowId],
    queryFn: () => getEscrow({ data: { id: escrowId } }),
  });
  const row = escrow.data;
  const listing = useQuery({
    queryKey: ["listing", row?.listingId],
    queryFn: () => getListing({ data: { id: row!.listingId } }),
    enabled: Boolean(row?.listingId),
  });
  const funded = useQuery({
    queryKey: ["escrow-bal", row?.address],
    queryFn: () => getEscrowBalance({ data: { address: row!.address! } }),
    enabled: Boolean(row?.address),
    refetchInterval: 20_000,
  });

  if (escrow.isLoading) {
    return (
      <Shell>
        <main className="mx-auto max-w-xl px-4 py-16">
          <div className="h-40 animate-pulse rounded-xl bg-card" />
        </main>
      </Shell>
    );
  }
  if (!row) {
    return (
      <Shell>
        <main className="mx-auto max-w-xl px-4 py-16">
          <p className="text-muted">No escrow.</p>
        </main>
      </Shell>
    );
  }

  const ticket = listing.data ? ticketCode(listing.data.id) : "";
  const ready = Boolean(row.address);

  return (
    <Shell>
      <main className="mx-auto max-w-xl px-4 py-12">
        {listing.data ? (
          <Link
            to="/listing/$id"
            params={{ id: String(listing.data.id) }}
            className="text-sm text-muted"
          >
            {ticket}
          </Link>
        ) : (
          <Link to="/" className="text-sm text-muted">
            Board
          </Link>
        )}
        <p className="mt-6 font-mono text-xs tracking-[0.18em] text-muted">BCH 2-OF-2</p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight">{row.amountBch} BCH</h1>
        <p className="mt-2 text-sm text-muted">
          Payer key and payee key. Both must sign to move it. Venice has no key
          and will not co-sign. If one of you disappears, the BCH stays in the
          2-of-2.
        </p>
        <p className="mt-3 font-mono text-xs uppercase text-muted">{row.status.replace("_", " ")}</p>

        <KeySlot
          label="BCH payer"
          have={Boolean(row.payerPub)}
          onPublish={async (pubkey) => {
            await addEscrowKey({ data: { id: escrowId, role: "payer", pubkey } });
            await qc.invalidateQueries({ queryKey: ["escrow", escrowId] });
          }}
        />
        <KeySlot
          label="BCH payee"
          have={Boolean(row.payeePub)}
          onPublish={async (pubkey) => {
            await addEscrowKey({ data: { id: escrowId, role: "payee", pubkey } });
            await qc.invalidateQueries({ queryKey: ["escrow", escrowId] });
          }}
        />
        {ready ? (
          <section className="mt-6 rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-medium">Fund this address</h2>
            <p className="mt-2 break-all font-mono text-xs">{row.address}</p>
            <p className="mt-2 text-sm text-muted">
              Send {row.amountBch} BCH. On-chain: {funded.data ? `${funded.data.bch} BCH` : "checking…"}
            </p>
            <CopyLine text={row.address ?? ""} />
          </section>
        ) : null}

        {ready ? <SpendBox escrowId={escrowId} /> : null}
      </main>
    </Shell>
  );
}

function KeySlot({
  label,
  have,
  onPublish,
}: {
  label: string;
  have: boolean;
  onPublish: (pubkey: string) => Promise<void>;
}) {
  const [pair, setPair] = useState<{ wif: string; pubkey: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="mt-4 rounded-xl border border-border bg-card p-4">
      <p className="text-sm font-medium">{label}</p>
      {have ? <p className="mt-1 text-xs text-muted">Public key is in the 2-of-2.</p> : (
        <>
          <Button
            type="button"
            variant="outline"
            className="mt-3"
            onClick={() => setPair(newBchKey())}
          >
            Generate my key
          </Button>
          {pair ? (
            <div className="mt-3 grid gap-2">
              <p className="text-xs text-sell">Save the WIF. We never store it.</p>
              <p className="break-all font-mono text-xs">WIF {pair.wif}</p>
              <Button
                type="button"
                disabled={busy}
                onClick={() => {
                  setBusy(true);
                  setError(null);
                  void onPublish(pair.pubkey)
                    .catch((e: Error) => setError(e.message))
                    .finally(() => setBusy(false));
                }}
              >
                Publish public key
              </Button>
            </div>
          ) : null}
        </>
      )}
      {error ? <p className="mt-2 text-sm text-sell">{error}</p> : null}
    </div>
  );
}

function CopyLine({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      className="mt-3"
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => {
          setDone(true);
          window.setTimeout(() => setDone(false), 1200);
        });
      }}
    >
      {done ? "Copied!" : "Copy address"}
    </Button>
  );
}

function SpendBox({ escrowId }: { escrowId: number }) {
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [txid, setTxid] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="mt-6 grid gap-3 rounded-xl border border-border bg-card p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setBusy(true);
        setError(null);
        void spendEscrow({
          data: {
            id: escrowId,
            dest: String(fd.get("dest")),
            wif1: String(fd.get("wif1")),
            wif2: String(fd.get("wif2")),
            kind: String(fd.get("kind")) === "refund" ? "refunded" : "released",
          },
        })
          .then(async (r) => {
            setTxid(r.txid);
            await qc.invalidateQueries({ queryKey: ["escrow", escrowId] });
          })
          .catch((err: Error) => setError(err.message))
          .finally(() => setBusy(false));
      }}
    >
      <h2 className="text-lg font-medium">Move the BCH</h2>
      <p className="text-sm text-muted">
        Both WIFs. Payer and payee. Venice does not sign and cannot refund you.
      </p>
      <div>
        <Label htmlFor="dest">Destination CashAddr</Label>
        <Input id="dest" name="dest" required placeholder="bitcoincash:q…" />
      </div>
      <div>
        <Label htmlFor="wif1">WIF 1</Label>
        <Input id="wif1" name="wif1" required autoComplete="off" />
      </div>
      <div>
        <Label htmlFor="wif2">WIF 2</Label>
        <Input id="wif2" name="wif2" required autoComplete="off" />
      </div>
      <div>
        <Label htmlFor="kind">This is a</Label>
        <select
          id="kind"
          name="kind"
          className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm"
        >
          <option value="release">Release to payee</option>
          <option value="refund">Refund to payer</option>
        </select>
      </div>
      {error ? <p className="text-sm text-sell">{error}</p> : null}
      {txid ? <p className="break-all font-mono text-xs">txid {txid}</p> : null}
      <Button type="submit" disabled={busy}>
        {busy ? "Signing…" : "Sign and broadcast"}
      </Button>
    </form>
  );
}

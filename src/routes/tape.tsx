import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Shell } from "@/components/shell";
import { listTape, type Print } from "@/lib/prints";
import { DISCORD_NAME } from "@/lib/carbon-config";

export const Route = createFileRoute("/tape")({ component: TapePage });

function TapePage() {
  const tape = useQuery({ queryKey: ["tape"], queryFn: () => listTape() });
  const rows = tape.data ?? [];
  return (
    <Shell>
      <main className="mx-auto max-w-2xl px-4 py-12">
        <p className="font-mono text-xs tracking-[0.22em] text-muted">THE TAPE</p>
        <h1 className="mt-3 text-3xl font-medium tracking-tight">Public prints. No eraser.</h1>
        <p className="mt-3 text-sm text-muted">
          Both sides stamp the ticket after they settle in {DISCORD_NAME}. Size,
          BCH rate, names, time — on this tape. Venice never held the coins.
          A thief gets a public scar. An honest miner gets a résumé.
        </p>
        <div className="mt-8 space-y-3">
          {tape.isLoading ? (
            <div className="h-40 animate-pulse rounded-xl bg-card" />
          ) : rows.length === 0 ? (
            <p className="rounded-xl border border-border bg-card px-5 py-10 text-center text-sm text-muted">
              No prints yet. Close a ticket with two stamps and it lands here.
            </p>
          ) : (
            rows.map((p) => <PrintRow key={p.listingId} print={p} />)
          )}
        </div>
      </main>
    </Shell>
  );
}

function PrintRow({ print }: { print: Print }) {
  return (
    <Link
      to="/listing/$id"
      params={{ id: String(print.listingId) }}
      className="block rounded-xl border border-border bg-card p-5 hover:border-flare/40"
    >
      <p className="font-mono text-xs tracking-[0.18em] text-flare">{print.code}</p>
      <p className="mt-2 text-lg font-medium">
        {print.amount} {print.coin}
        <span className="ml-2 font-mono text-sm text-muted">@ {print.price} BCH</span>
      </p>
      <p className="mt-2 font-mono text-sm">
        @{print.poster} ↔ @{print.other}
      </p>
      <p className="mt-1 text-xs text-muted">
        {print.printedAt ? new Date(print.printedAt).toUTCString() : "pending"}
      </p>
    </Link>
  );
}

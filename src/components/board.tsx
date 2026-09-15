import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { COINS, coinName } from "@/lib/coins";
import { DISCORD_NAME } from "@/lib/carbon-config";
import { ticketCode } from "@/lib/handshake";
import { listListings, listingStats, postOffer, type PublicListing } from "@/lib/listings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export function Board() {
  const [coin, setCoin] = useState<string>("");
  const listings = useQuery({
    queryKey: ["listings", coin],
    queryFn: () => listListings({ data: coin ? { coin } : {} }),
  });
  const stats = useQuery({ queryKey: ["stats"], queryFn: () => listingStats() });
  const rows = listings.data ?? [];
  const books = useMemo(() => {
    const tickers = coin ? [coin] : COINS.map((c) => c.ticker);
    return tickers.map((ticker) => {
      const mine = rows.filter((r) => r.coin === ticker);
      const bids = [...mine.filter((r) => r.side === "buy")].sort(
        (a, b) => Number(b.price) - Number(a.price),
      );
      const asks = [...mine.filter((r) => r.side === "sell")].sort(
        (a, b) => Number(a.price) - Number(b.price),
      );
      return { ticker, bids, asks };
    });
  }, [rows, coin]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Open tickets" value={stats.data?.open_count ?? "—"} />
        <Stat label="Bids" value={stats.data?.buy_count ?? "—"} />
        <Stat label="Asks" value={stats.data?.sell_count ?? "—"} />
        <Stat label="Books" value={stats.data?.coin_count ?? "—"} />
      </div>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        <FilterChip active={!coin} onClick={() => setCoin("")}>
          All books
        </FilterChip>
        {COINS.map((c) => (
          <FilterChip key={c.ticker} active={coin === c.ticker} onClick={() => setCoin(c.ticker)}>
            {c.ticker}/BCH
          </FilterChip>
        ))}
      </div>
      {listings.isError ? (
        <p className="rounded-xl border border-border bg-card px-5 py-10 text-center text-sm text-sell">
          {listings.error instanceof Error ? listings.error.message : "Board failed to load"}
        </p>
      ) : listings.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-card" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {books.map((book) => (
            <OrderBook key={book.ticker} ticker={book.ticker} bids={book.bids} asks={book.asks} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderBook({
  ticker,
  bids,
  asks,
}: {
  ticker: string;
  bids: PublicListing[];
  asks: PublicListing[];
}) {
  const bestBid = bids[0] ? Number(bids[0].price) : null;
  const bestAsk = asks[0] ? Number(asks[0].price) : null;
  const spread =
    bestBid != null && bestAsk != null && Number.isFinite(bestAsk - bestBid)
      ? bestAsk - bestBid
      : null;
  return (
    <section className="rounded-xl border border-border bg-card">
      <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border px-4 py-3">
        <h2 className="font-mono text-sm tracking-[0.12em]">
          {ticker}/BCH
          <span className="ml-2 font-sans text-xs font-normal tracking-normal text-muted">
            {coinName(ticker)}
          </span>
        </h2>
        <p className="font-mono text-xs text-muted">
          {bestBid != null ? <span className="text-buy">bid {bestBid}</span> : "bid —"}
          <span className="mx-2 text-border">|</span>
          {bestAsk != null ? <span className="text-sell">ask {bestAsk}</span> : "ask —"}
          {spread != null ? <span className="ml-2">spr {spread.toPrecision(4)}</span> : null}
        </p>
      </header>
      <div className="grid md:grid-cols-2">
        <BookSide title="Bids" side="buy" ticker={ticker} rows={bids} empty="No bids" />
        <BookSide title="Asks" side="sell" ticker={ticker} rows={asks} empty="No asks" />
      </div>
    </section>
  );
}

function BookSide({
  title,
  side,
  ticker,
  rows,
  empty,
}: {
  title: string;
  side: "buy" | "sell";
  ticker: string;
  rows: PublicListing[];
  empty: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("px-2 py-2", side === "sell" ? "md:border-l md:border-border" : "")}>
      <div
        className={cn(
          "grid grid-cols-[1fr_1fr_1fr] gap-2 px-2 py-1 font-mono text-[10px] uppercase tracking-wider",
          side === "buy" ? "text-buy" : "text-sell",
        )}
      >
        <span>{title}</span>
        <span className="text-right">Size</span>
        <span className="text-right">Price BCH</span>
      </div>
      {rows.length === 0 ? (
        <p className="px-2 py-6 text-center text-xs text-muted">{empty}</p>
      ) : (
        <ul>
          {rows.map((row) => (
            <li key={row.id}>
              <Link
                to="/listing/$id"
                params={{ id: String(row.id) }}
                className="grid grid-cols-[1fr_1fr_1fr] items-center gap-2 rounded-md px-2 py-2 font-mono text-xs tabular-nums hover:bg-background"
              >
                <span className="truncate text-muted">
                  {ticketCode(row.id)}
                  {row.funded ? " · F" : ""}
                </span>
                <span className="text-right">{row.amount}</span>
                <span className={cn("text-right", side === "buy" ? "text-buy" : "text-sell")}>
                  {row.price}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="px-2 pt-2">
        <button
          type="button"
          className="h-9 text-xs text-muted hover:text-foreground"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : side === "buy" ? `+ Bid ${ticker}` : `+ Ask ${ticker}`}
        </button>
        {open ? <BookPost coin={ticker} side={side} onDone={() => setOpen(false)} /> : null}
      </div>
    </div>
  );
}

function BookPost({
  coin,
  side,
  onDone,
}: {
  coin: string;
  side: "buy" | "sell";
  onDone: () => void;
}) {
  const nav = useNavigate();
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const mut = useMutation({
    mutationFn: postOffer,
    onSuccess: async (res) => {
      await qc.invalidateQueries();
      onDone();
      void nav({ to: "/listing/$id", params: { id: String(res.id) } });
    },
    onError: (e: Error) => setError(e.message || "Could not post"),
  });
  return (
    <form
      className="mt-2 grid gap-2 rounded-md border border-border p-2"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const fd = new FormData(e.currentTarget);
        mut.mutate({
          data: {
            side,
            coin,
            amount: String(fd.get("amount")).trim(),
            quoteAsset: "BCH",
            price: String(fd.get("price")).trim(),
            notes: String(fd.get("notes") ?? ""),
            discord: String(fd.get("discord")).trim(),
            wallet: String(fd.get("wallet")).trim(),
          },
        });
      }}
    >
      <Input name="amount" required placeholder="Size" inputMode="decimal" />
      <Input name="price" required placeholder="Price in BCH" inputMode="decimal" />
      <Input name="discord" required placeholder={`${DISCORD_NAME} username`} />
      <Input name="wallet" required placeholder="Public wallet" />
      <Input name="notes" placeholder="Note (optional)" />
      {error ? <p className="text-xs text-sell">{error}</p> : null}
      <Button type="submit" disabled={mut.isPending}>
        {mut.isPending ? "Posting…" : side === "buy" ? "Post bid" : "Post ask"}
      </Button>
    </form>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <div className="text-xs uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-1 font-mono text-xl tabular-nums">{value}</div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-11 shrink-0 rounded-full border px-4 text-sm",
        active ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted",
      )}
    >
      {children}
    </button>
  );
}

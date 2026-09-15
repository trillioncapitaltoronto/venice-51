import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listTape } from "@/lib/prints";

export function TapeStrip() {
  const tape = useQuery({ queryKey: ["tape"], queryFn: () => listTape() });
  const rows = (tape.data ?? []).slice(0, 8);
  if (rows.length === 0) return null;
  return (
    <div className="overflow-hidden border-y border-border py-3">
      <div className="flex gap-8 font-mono text-xs">
        {rows.map((p) => (
          <Link
            key={p.listingId}
            to="/listing/$id"
            params={{ id: String(p.listingId) }}
            className="shrink-0 text-muted hover:text-foreground"
          >
            <span className="text-flare">{p.code}</span>
            <span className="ml-2">
              {p.amount} {p.coin} @ {p.price} BCH
            </span>
            <span className="ml-2">
              @{p.poster} ↔ @{p.other}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

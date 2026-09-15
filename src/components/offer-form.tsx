import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { COINS } from "@/lib/coins";
import { DISCORD_NAME } from "@/lib/carbon-config";
import { postOffer } from "@/lib/listings";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { TctcFields } from "@/components/tctc-fields";

export function OfferForm({
  onDone,
  initialSide = "sell",
}: {
  onDone?: () => void;
  initialSide?: "buy" | "sell";
}) {
  const nav = useNavigate();
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [side, setSide] = useState<"buy" | "sell">(initialSide);
  const mut = useMutation({
    mutationFn: postOffer,
    onSuccess: async (res) => {
      await qc.invalidateQueries();
      onDone?.();
      void nav({ to: "/listing/$id", params: { id: String(res.id) } });
    },
    onError: (e: Error) => setError(e.message || "Could not post"),
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const fd = new FormData(e.currentTarget);
        mut.mutate({
          data: {
            side,
            coin: String(fd.get("coin")),
            amount: String(fd.get("amount")).trim(),
            quoteAsset: "BCH",
            price: String(fd.get("price")).trim(),
            notes: String(fd.get("notes") ?? ""),
            discord: String(fd.get("discord")).trim(),
            wallet: String(fd.get("wallet")).trim(),
            passChain: String(fd.get("passChain")) as "kda" | "kas" | "nexa",
            passAddress: String(fd.get("passAddress")).trim(),
          },
        });
      }}
    >
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setSide("sell")}
          className={`h-11 rounded-md border text-sm font-medium ${
            side === "sell" ? "border-sell text-sell" : "border-border text-muted"
          }`}
        >
          I am selling
        </button>
        <button
          type="button"
          onClick={() => setSide("buy")}
          className={`h-11 rounded-md border text-sm font-medium ${
            side === "buy" ? "border-buy text-buy" : "border-border text-muted"
          }`}
        >
          I am buying
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="coin">Coin</Label>
          <Select id="coin" name="coin" required defaultValue="WART">
            {COINS.map((c) => (
              <option key={c.ticker} value={c.ticker}>
                {c.ticker} — {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="amount">Size</Label>
          <Input id="amount" name="amount" required placeholder="1000" inputMode="decimal" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="price">Ask in BCH (per coin)</Label>
          <Input id="price" name="price" required placeholder="0.00008" inputMode="decimal" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="discord">{`${DISCORD_NAME} username (how the room finds you)`}</Label>
          <Input id="discord" name="discord" required placeholder="username" />
        </div>
        <div className="sm:col-span-2">
          <TctcFields />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="wallet">Public wallet we watch on the chain explorer</Label>
          <Input id="wallet" name="wallet" required placeholder="public address" />
        </div>
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" maxLength={280} placeholder="Min size, chain, whatever the room needs" />
      </div>
      {error ? <p className="text-sm text-sell">{error}</p> : null}
      <Button type="submit" disabled={mut.isPending}>
        {mut.isPending ? "Posting…" : "Post ticket"}
      </Button>
    </form>
  );
}

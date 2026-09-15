import { useState } from "react";
import { TCTC_CHAINS, TCTC_GRANT, type CarbonChain } from "@/lib/carbon-config";
import { Input, Label } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export function TctcChainPicker({
  value,
  onChange,
  name = "passChain",
}: {
  value: CarbonChain;
  onChange: (id: CarbonChain) => void;
  name?: string;
}) {
  return (
    <div>
      <Label>Verify on this chain</Label>
      <input type="hidden" name={name} value={value} />
      <div className="mt-2 grid grid-cols-3 gap-2">
        {TCTC_CHAINS.map((c) => (
          <button
            key={c.id}
            type="button"
            disabled={!c.ready}
            onClick={() => onChange(c.id)}
            className={cn(
              "h-11 rounded-md border text-sm font-medium",
              value === c.id ? "border-flare text-flare" : "border-border text-muted",
            )}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export function TctcFields() {
  const [chain, setChain] = useState<CarbonChain>("kda");
  const spec = TCTC_CHAINS.find((c) => c.id === chain);
  return (
    <div className="grid gap-4">
      <TctcChainPicker value={chain} onChange={setChain} />
      <div>
        <Label htmlFor="passAddress">
          {`${spec?.name ?? "TCTC"} wallet — must hold ≥ ${TCTC_GRANT.toLocaleString()} TCTC`}
        </Label>
        <Input
          id="passAddress"
          name="passAddress"
          required
          placeholder={
            chain === "kda" ? "k:…" : chain === "kas" ? "kaspa:…" : "nexa:…"
          }
        />
      </div>
    </div>
  );
}

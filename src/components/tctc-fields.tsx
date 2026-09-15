import { TCTC_CHAINS } from "@/lib/carbon-config";
import { Input, Label, Select } from "@/components/ui/field";

export function TctcFields() {
  return (
    <>
      <div>
        <Label htmlFor="passChain">TCTC pass — chain</Label>
        <Select id="passChain" name="passChain" required defaultValue="kda">
          {TCTC_CHAINS.map((c) => (
            <option key={c.id} value={c.id} disabled={!c.ready}>
              {c.name}
              {c.ready ? "" : " — token id coming"}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="passAddress">TCTC wallet (must hold ≥ 1)</Label>
        <Input id="passAddress" name="passAddress" required placeholder="k:… or kaspa:…" />
      </div>
    </>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PITCH_DISCORD, PITCH_ONE_LINER, PITCH_X, SITE_URL } from "@/lib/pitch";

export function PitchBox() {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="text-lg font-medium">Tell the room</h2>
      <p className="mt-1 text-sm text-muted">
        Paste this in Discord, X, Telegram. Same pitch everywhere. Don’t rewrite it.
      </p>
      <p className="mt-4 font-mono text-sm text-flare">{PITCH_ONE_LINER}</p>
      <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-md border border-border bg-background p-4 font-mono text-xs leading-relaxed">
        {PITCH_DISCORD}
      </pre>
      <div className="mt-4 flex flex-wrap gap-2">
        <CopyBtn label="Copy Discord pitch" text={PITCH_DISCORD} />
        <CopyBtn label="Copy X pitch" text={PITCH_X} />
        <CopyBtn label="Copy link" text={SITE_URL} />
      </div>
    </section>
  );
}

function CopyBtn({ label, text }: { label: string; text: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => {
          setDone(true);
          window.setTimeout(() => setDone(false), 1400);
        });
      }}
    >
      {done ? "Copied!" : label}
    </Button>
  );
}

import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { DISCORD_INVITE, DISCORD_NAME } from "@/lib/carbon-config";
import { cn } from "@/lib/utils";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-baseline gap-3">
            <span className="font-mono text-sm font-semibold tracking-[0.18em]">VENICE 51</span>
            <span className="hidden text-xs text-muted sm:inline">Coin / BCH</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <NavLink to="/">Board</NavLink>
            <NavLink to="/pass">TCTC</NavLink>
            <NavLink to="/desk">Club</NavLink>
            <NavLink to="/guide">Desk rules</NavLink>
          </nav>
          <a
            href={DISCORD_INVITE}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center rounded-md border border-border px-4 text-sm font-medium"
          >
            {DISCORD_NAME}
          </a>
        </div>
      </header>
      {children}
      <footer className="relative overflow-hidden border-t border-border">
        <img
          src="/art-refinery.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <p className="relative px-4 py-10 text-center text-xs text-muted">
          Venice 51 — public sales, referred names, Coin / BCH. Witnesses beat
          thieves. Honesty is paramount. Floor is {DISCORD_NAME}. No escrow.
        </p>
      </footer>
    </div>
  );
}

function NavLink({ to, children }: { to: string; children: string }) {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex h-11 items-center rounded-md px-3 text-muted hover:text-foreground",
      )}
      activeProps={{ className: "text-foreground" }}
    >
      {children}
    </Link>
  );
}

import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { DISCORD_INVITE, DISCORD_NAME } from "@/lib/carbon-config";
import { cn } from "@/lib/utils";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <span className="font-mono text-sm font-semibold tracking-[0.18em]">VENICE 51</span>
            <span className="hidden h-4 w-px bg-border sm:block" />
            <img
              src="/tctc-lockup.png"
              alt="Trillion Capital Toronto Corporation"
              className="hidden h-5 w-auto sm:block sm:h-6"
            />
            <img
              src="/plutus-mark.png"
              alt="Plutus"
              className="h-8 w-8 rounded-full sm:h-9 sm:w-9"
            />
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
        <div className="relative flex flex-col items-center gap-4 px-4 py-10">
          <div className="flex flex-wrap items-center justify-center gap-8">
            <img
              src="/tctc-lockup.png"
              alt="Trillion Capital Toronto Corporation"
              className="h-8 w-auto"
            />
            <img
              src="/plutus-lockup.png"
              alt="Plutus"
              className="h-20 w-auto"
            />
          </div>
          <p className="max-w-xl text-center text-xs text-muted">
            Venice 51 is a Trillion Capital venue. Plutus is the Trillion Capital
            research and development division. Coin / BCH books, Discord floor.
            TCTC is required and free. Volunteers welcome. No escrow.
          </p>
        </div>
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

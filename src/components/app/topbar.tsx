"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Plus, ChevronsUpDown, Check, LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { logout } from "@/app/(auth)/actions";

type WorkspaceItem = {
  id: string;
  name: string;
  slug: string;
  type: string;
  role: string;
  isOrganization: boolean;
};

export function Topbar({
  user,
  workspaces,
}: {
  user: { name: string | null; email: string | null };
  workspaces: WorkspaceItem[];
}) {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl md:px-8">
      {/* Workspace switcher (plan §40) */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-xl border border-transparent px-2 py-1.5 text-sm font-medium hover:bg-accent"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-lg teal-accent text-[10px] font-bold text-white">
            {initials(workspaces[0]?.name)}
          </span>
          <span className="hidden sm:block">{workspaces[0]?.name ?? "Workspace"}</span>
          <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute left-0 top-11 z-50 w-72 rounded-2xl border bg-card p-2 shadow-glass">
              <p className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Switch workspace
              </p>
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm hover:bg-accent"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg teal-accent text-[10px] font-bold text-white">
                    {initials(ws.name)}
                  </span>
                  <span className="flex-1">
                    <span className="block font-medium">{ws.name}</span>
                    <span className="block text-[11px] text-muted-foreground">
                      {ws.isOrganization ? ws.role : "Personal"}
                    </span>
                  </span>
                </button>
              ))}
              <div className="my-1 h-px bg-border" />
              <Link
                href="/onboarding"
                className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-sm hover:bg-accent"
              >
                <Plus className="h-4 w-4" /> Create workspace
              </Link>
            </div>
          </>
        )}
      </div>

      <div className="flex-1" />

      {/* Search (plan §45) */}
      <button
        type="button"
        className="hidden items-center gap-2 rounded-xl border bg-card px-3 py-1.5 text-sm text-muted-foreground shadow-sm hover:bg-accent md:flex"
      >
        <Search className="h-3.5 w-3.5" /> Search…
        <kbd className="rounded border bg-muted px-1.5 text-[10px]">⌘K</kbd>
      </button>

      <Button asChild size="sm">
        <Link href="/app/invoices/new">
          <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Create</span>
        </Link>
      </Button>

      {/* User menu */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setUserMenuOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
        >
          {initials(user.name)}
        </button>
        {userMenuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
            <div className="absolute right-0 top-11 z-50 w-56 rounded-2xl border bg-card p-2 shadow-glass">
              <div className="border-b border-border px-3 py-2">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Link
                href="/app/settings"
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-accent"
              >
                <UserRound className="h-4 w-4" /> Profile & sessions
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className={cn(
                    "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-accent",
                  )}
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

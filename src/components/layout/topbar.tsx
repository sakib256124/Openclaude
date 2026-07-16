"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Bell, ChevronDown, Cloud, Folder, LogOut, Menu, RefreshCw, UserCircle } from "lucide-react";
import * as React from "react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { GlobalSearch } from "@/components/layout/global-search";
import { Button } from "@/components/ui/button";
import { ConnectionBadge } from "@/components/ui/connection-badge";
import type { AppSessionUser } from "@/lib/auth";

type TopbarProps = {
  user: AppSessionUser;
  notificationCount: number;
  onOpenMobileNav: () => void;
};

export function Topbar({ user, notificationCount, onOpenMobileNav }: TopbarProps) {
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const router = useRouter();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:h-16 lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button className="lg:hidden" size="icon" variant="ghost" aria-label="Open navigation" onClick={onOpenMobileNav}>
          <Menu />
        </Button>
        <div className="hidden min-w-0 lg:block">
          <Breadcrumbs />
        </div>
        <div className="text-sm font-semibold leading-5 lg:hidden">OpenCloud</div>
      </div>

      <GlobalSearch />

      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 lg:flex">
          <Button variant="secondary" size="sm" disabled>
            <Cloud />
            localhost
          </Button>
          <Button variant="secondary" size="sm" disabled>
            <Folder />
            Ubuntu Lab
          </Button>
          <ConnectionBadge status="not-configured" />
        </div>
        <Button variant="ghost" size="icon" aria-label="Refresh current page" onClick={() => router.refresh()}>
          <RefreshCw />
        </Button>
        <Button className="relative" variant="ghost" size="icon" aria-label="Notifications">
          <Bell />
          {notificationCount > 0 ? (
            <span className="absolute right-1 top-1 min-w-4 rounded-full bg-primary px-1 text-[10px] font-bold leading-4 text-primary-foreground">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          ) : null}
        </Button>
        <div className="relative">
          <Button
            variant="secondary"
            size="sm"
            aria-label="User menu"
            aria-expanded={userMenuOpen}
            onClick={() => setUserMenuOpen((open) => !open)}
          >
            <UserCircle />
            <span className="hidden max-w-[140px] truncate sm:inline">{user.name ?? user.email}</span>
            <ChevronDown />
          </Button>
          {userMenuOpen ? (
            <div className="absolute right-0 mt-2 w-72 rounded-md border bg-[var(--surface-elevated)] p-3 shadow-xl shadow-black/30">
              <div className="border-b pb-3">
                <div className="truncate text-sm font-semibold">{user.name ?? "OpenCloud user"}</div>
                <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                <div className="mt-2 inline-flex rounded-sm border px-2 py-0.5 text-xs font-semibold text-primary">
                  {user.role}
                </div>
              </div>
              <Button asChild className="mt-3 w-full justify-start" variant="ghost" size="sm">
                <Link href="/profile">
                  <UserCircle />
                  Profile
                </Link>
              </Button>
              <Button
                className="mt-3 w-full justify-start"
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut />
                Sign out
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

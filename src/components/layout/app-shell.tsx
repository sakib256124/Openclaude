"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { ToastProvider } from "@/components/ui/toast-provider";
import type { AppSessionUser } from "@/lib/auth";

const sidebarStorageKey = "opencloud:sidebar-collapsed";
const sidebarWidthStorageKey = "opencloud:sidebar-width";
const defaultSidebarWidth = 248;

type AppShellProps = {
  children: React.ReactNode;
  user: AppSessionUser;
  notificationCount: number;
};

export function AppShell({ children, user, notificationCount }: AppShellProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [sidebarWidth, setSidebarWidth] = React.useState(defaultSidebarWidth);

  React.useEffect(() => {
    const saved = window.localStorage.getItem(sidebarStorageKey);
    if (saved) {
      setCollapsed(saved === "true");
    }

    const savedWidth = Number(window.localStorage.getItem(sidebarWidthStorageKey));
    if (Number.isFinite(savedWidth) && savedWidth >= 220 && savedWidth <= 420) {
      setSidebarWidth(savedWidth);
    }
  }, []);

  const updateCollapsed = React.useCallback((value: boolean) => {
    setCollapsed(value);
    window.localStorage.setItem(sidebarStorageKey, String(value));
  }, []);

  const updateSidebarWidth = React.useCallback((value: number) => {
    const nextWidth = Math.min(420, Math.max(220, Math.round(value)));
    setSidebarWidth(nextWidth);
    window.localStorage.setItem(sidebarWidthStorageKey, String(nextWidth));
  }, []);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background">
        <Sidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          width={sidebarWidth}
          onCollapsedChange={updateCollapsed}
          onMobileOpenChange={setMobileOpen}
          onWidthChange={updateSidebarWidth}
        />
        <div
          className="min-h-screen transition-[padding] duration-200 lg:pl-[var(--sidebar-shell-width)]"
          style={{ "--sidebar-shell-width": `${collapsed ? 72 : sidebarWidth}px` } as React.CSSProperties}
        >
          <Topbar
            user={user}
            notificationCount={notificationCount}
            onOpenMobileNav={() => setMobileOpen(true)}
          />
          <main className="mx-auto flex w-full max-w-[1480px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}

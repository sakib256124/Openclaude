"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { LogoMark } from "@/components/layout/logo-mark";
import { navigationGroups } from "@/components/layout/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const groupStorageKey = "opencloud:navigation-groups";

type SidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  width: number;
  onCollapsedChange: (value: boolean) => void;
  onMobileOpenChange: (value: boolean) => void;
  onWidthChange: (value: number) => void;
};

function isActiveRoute(pathname: string, href: string) {
  const route = href.split("#")[0];
  return pathname === route || (route !== "/dashboard" && pathname.startsWith(`${route}/`));
}

export function Sidebar({ collapsed, mobileOpen, width, onCollapsedChange, onMobileOpenChange, onWidthChange }: SidebarProps) {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>(
    Object.fromEntries(navigationGroups.map((group) => [group.id, true]))
  );
  const [resizing, setResizing] = React.useState(false);

  React.useEffect(() => {
    const saved = window.localStorage.getItem(groupStorageKey);
    if (saved) {
      setExpandedGroups(JSON.parse(saved) as Record<string, boolean>);
    }
  }, []);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((current) => {
      const next = { ...current, [groupId]: !current[groupId] };
      window.localStorage.setItem(groupStorageKey, JSON.stringify(next));
      return next;
    });
  };

  const startResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (collapsed) {
      return;
    }

    event.preventDefault();
    setResizing(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const handlePointerMove = (moveEvent: PointerEvent) => {
      onWidthChange(moveEvent.clientX);
    };

    const stopResize = () => {
      setResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopResize);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopResize);
  };

  const sidebar = (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col border-r bg-[var(--sidebar-background)] transition-all duration-200",
        collapsed ? "w-[72px]" : "w-[var(--sidebar-width)]",
        resizing && "transition-none",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
      style={{ "--sidebar-width": `${width}px` } as React.CSSProperties}
      aria-label="Primary navigation"
    >
      <div className="flex h-[72px] items-center gap-3 border-b px-3">
        <LogoMark />
        {!collapsed ? (
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold leading-5">OpenCloud</div>
            <div className="truncate text-xs leading-[18px] text-muted-foreground">Compute Console</div>
          </div>
        ) : null}
        <Button className="lg:hidden" size="icon" variant="ghost" aria-label="Close navigation" onClick={() => onMobileOpenChange(false)}>
          <X />
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-3">
          {navigationGroups.map((group) => {
            const expanded = expandedGroups[group.id] ?? true;
            return (
              <section key={group.id} className="space-y-1">
                {!collapsed ? (
                  <button
                    type="button"
                    className="flex h-8 w-full items-center justify-between rounded-md px-2 text-left text-xs font-semibold uppercase tracking-normal text-muted-foreground hover:bg-[var(--surface-hover)]"
                    onClick={() => toggleGroup(group.id)}
                    aria-expanded={expanded}
                  >
                    <span>{group.label}</span>
                    <ChevronDown className={cn("h-4 w-4 transition", expanded ? "rotate-0" : "-rotate-90")} />
                  </button>
                ) : null}
                {(expanded || collapsed) && (
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const active = isActiveRoute(pathname, item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          title={collapsed ? item.label : undefined}
                          aria-current={active ? "page" : undefined}
                          onClick={() => onMobileOpenChange(false)}
                          className={cn(
                            "group relative flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium leading-5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            active
                              ? "bg-[var(--accent-subtle)] text-foreground"
                              : "text-muted-foreground hover:bg-[var(--surface-hover)] hover:text-foreground",
                            collapsed && "justify-center px-0"
                          )}
                        >
                          <item.icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-primary")} />
                          {!collapsed ? <span className="truncate">{item.label}</span> : null}
                          {collapsed ? (
                            <span className="pointer-events-none absolute left-[52px] z-50 hidden whitespace-nowrap rounded-md border bg-[var(--surface-elevated)] px-2 py-1 text-xs text-foreground shadow-lg group-hover:block">
                              {item.label}
                            </span>
                          ) : null}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </nav>

      <div className="hidden border-t p-3 lg:block">
        <Button
          className={cn("w-full", collapsed && "px-0")}
          variant="secondary"
          size={collapsed ? "icon" : "sm"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => onCollapsedChange(!collapsed)}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
          {!collapsed ? "Collapse" : null}
        </Button>
      </div>
      {!collapsed ? (
        <button
          type="button"
          aria-label="Resize sidebar"
          className={cn(
            "absolute inset-y-0 right-[-4px] hidden w-2 cursor-col-resize touch-none lg:block",
            "after:absolute after:inset-y-0 after:left-1/2 after:w-px after:-translate-x-1/2 after:bg-transparent after:transition",
            "hover:after:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            resizing && "after:bg-primary"
          )}
          onPointerDown={startResize}
        />
      ) : null}
    </aside>
  );

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          aria-label="Close navigation overlay"
          onClick={() => onMobileOpenChange(false)}
        />
      ) : null}
      {sidebar}
    </>
  );
}

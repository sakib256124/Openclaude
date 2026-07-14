"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ResourceAction = {
  label: string;
  disabled?: boolean;
  destructive?: boolean;
  onSelect?: () => void;
};

export function ResourceActionMenu({ actions }: { actions: ResourceAction[] }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="icon" aria-label="Resource actions">
          <MoreHorizontal />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" className="z-50 min-w-48 rounded-md border bg-card p-1 shadow-xl">
          {actions.map((action) => (
            <DropdownMenu.Item
              key={action.label}
              disabled={action.disabled}
              onSelect={action.onSelect}
              className="cursor-pointer rounded-sm px-3 py-2 text-sm outline-none hover:bg-[var(--surface-hover)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            >
              <span className={action.destructive ? "text-destructive" : undefined}>{action.label}</span>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed bg-card p-8 text-center", className)}>
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-[var(--accent-subtle)] text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="text-lg font-semibold leading-[26px]">{title}</h2>
      <p className="mt-2 max-w-xl text-sm leading-[21px] text-muted-foreground">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

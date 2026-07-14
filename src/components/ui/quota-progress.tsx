import { cn } from "@/lib/utils";

export function QuotaProgress({ label, used, limit }: { label: string; used: number; limit: number }) {
  const percent = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const tone = percent >= 95 ? "bg-destructive" : percent >= 80 ? "bg-[var(--warning)]" : "bg-primary";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm leading-5">
        <span className="font-medium">{label}</span>
        <span className="font-mono text-xs text-muted-foreground">
          {used}/{limit}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

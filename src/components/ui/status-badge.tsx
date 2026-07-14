import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  ACTIVE: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  UP: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  AVAILABLE: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  SUCCESS: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  SAVED: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  RESERVED: "border-cyan-400/40 bg-cyan-400/10 text-cyan-100",
  "IN-USE": "border-cyan-400/40 bg-cyan-400/10 text-cyan-100",
  SHUTOFF: "border-slate-400/30 bg-slate-400/10 text-slate-200",
  BUILD: "border-blue-400/40 bg-blue-400/10 text-blue-200",
  REBOOT: "border-blue-400/40 bg-blue-400/10 text-blue-200",
  ERROR: "border-red-400/40 bg-red-400/10 text-red-200",
  FAILURE: "border-red-400/40 bg-red-400/10 text-red-200",
  PAUSED: "border-yellow-400/40 bg-yellow-400/10 text-yellow-100",
  SUSPENDED: "border-yellow-400/40 bg-yellow-400/10 text-yellow-100",
  UNKNOWN: "border-slate-400/30 bg-slate-400/10 text-slate-200"
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const normalized = status.toUpperCase();
  return <Badge className={cn(statusStyles[normalized] ?? statusStyles.UNKNOWN, className)}>{status}</Badge>;
}

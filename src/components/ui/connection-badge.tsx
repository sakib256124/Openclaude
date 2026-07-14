import { CloudOff, ShieldCheck, Signal, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ConnectionStatus = "healthy" | "degraded" | "unavailable" | "not-configured";

const content: Record<ConnectionStatus, { label: string; className: string; icon: typeof Signal }> = {
  healthy: {
    label: "Connected",
    className: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
    icon: ShieldCheck
  },
  degraded: {
    label: "Degraded",
    className: "border-yellow-400/40 bg-yellow-400/10 text-yellow-100",
    icon: TriangleAlert
  },
  unavailable: {
    label: "Unavailable",
    className: "border-red-400/40 bg-red-400/10 text-red-200",
    icon: CloudOff
  },
  "not-configured": {
    label: "Not configured",
    className: "border-slate-400/30 bg-slate-400/10 text-slate-200",
    icon: Signal
  }
};

export function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  const item = content[status];
  return (
    <Badge className={item.className}>
      <item.icon className="mr-1 h-3 w-3" />
      {item.label}
    </Badge>
  );
}

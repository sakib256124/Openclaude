import type { LucideIcon } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";

export function ResourceCard({
  title,
  value,
  helper,
  icon: Icon
}: {
  title: string;
  value: string;
  helper: string;
  icon: LucideIcon;
}) {
  return <MetricCard title={title} value={value} helper={helper} icon={Icon} />;
}

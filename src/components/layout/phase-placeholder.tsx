import type { LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export function PhasePlaceholder({
  title,
  description,
  icon
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
}) {
  return <EmptyState title={title} description={description} icon={icon} className="min-h-[360px]" />;
}

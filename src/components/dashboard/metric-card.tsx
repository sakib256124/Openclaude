import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MetricCard({
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
  return (
    <Card className="min-h-[136px]">
      <CardHeader className="flex-row items-center justify-between gap-4 pb-2">
        <CardTitle className="text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-[26px] font-semibold leading-[34px] text-foreground sm:text-[30px] sm:leading-[38px]">{value}</div>
        <p className="mt-2 text-xs leading-[18px] text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const resourceUsage = [
  { label: "CPU", value: 62, color: "bg-primary" },
  { label: "RAM", value: 54, color: "bg-blue-400" },
  { label: "Storage", value: 45, color: "bg-amber-400" },
  { label: "Network", value: 38, color: "bg-emerald-400" }
];

export function ResourceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resource usage</CardTitle>
      </CardHeader>
      <CardContent className="min-h-72 space-y-6">
        <div className="grid gap-3 sm:grid-cols-4">
          {resourceUsage.map((item) => (
            <div key={item.label} className="rounded-md border bg-background p-3">
              <div className="text-xs text-muted-foreground">{item.label}</div>
              <div className="mt-2 text-2xl font-semibold">{item.value}%</div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {resourceUsage.map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.label} utilization</span>
                <span className="font-mono text-xs text-muted-foreground">{item.value}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Demo sample based on OpenStack-style telemetry overview.</p>
      </CardContent>
    </Card>
  );
}

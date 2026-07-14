import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const statuses = [
  { label: "Running", value: 8, className: "bg-emerald-400" },
  { label: "Stopped", value: 3, className: "bg-slate-400" },
  { label: "Building", value: 1, className: "bg-blue-400" },
  { label: "Error", value: 1, className: "bg-red-400" }
];

export function InstanceStatusChart() {
  const total = statuses.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Instance status</CardTitle>
      </CardHeader>
      <CardContent className="min-h-72 space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-4xl font-semibold">{total}</div>
            <div className="text-sm text-muted-foreground">Total demo instances</div>
          </div>
          <div className="text-right text-sm text-muted-foreground">RegionOne</div>
        </div>
        <div className="flex h-4 overflow-hidden rounded-full bg-muted">
          {statuses.map((item) => (
            <div
              key={item.label}
              className={item.className}
              style={{ width: `${Math.round((item.value / total) * 100)}%` }}
              title={`${item.label}: ${item.value}`}
            />
          ))}
        </div>
        <div className="space-y-3">
          {statuses.map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-md border bg-background p-3 text-sm">
              <span className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${item.className}`} />
                {item.label}
              </span>
              <span className="font-mono text-xs text-muted-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

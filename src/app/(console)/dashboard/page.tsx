import { Activity, Cpu, Database, Network, Server } from "lucide-react";
import { InstanceStatusChart } from "@/components/dashboard/instance-status-chart";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ResourceChart } from "@/components/dashboard/resource-chart";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectionBadge } from "@/components/ui/connection-badge";
import { LastUpdated } from "@/components/ui/last-updated";
import { QuotaProgress } from "@/components/ui/quota-progress";
import { RefreshButton } from "@/components/ui/refresh-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { demoDashboardMetrics, demoQuotaUsage, demoRecentInstances, demoServiceHealth } from "@/lib/demo-data";

export default function DashboardPage() {
  const metricIcons = [Server, Activity, Server, Activity, Cpu, Cpu, Database, Network];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Demo Ubuntu Multipass overview with sample local VM resource values for presentation."
        actions={
          <>
            <LastUpdated value={new Date("2026-07-14T11:45:00")} />
            <RefreshButton />
            <ConnectionBadge status="healthy" />
          </>
        }
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {demoDashboardMetrics.map((metric, index) => (
          <MetricCard key={metric.title} {...metric} icon={metricIcons[index] ?? Server} />
        ))}
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Quota usage</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {demoQuotaUsage.map((quota) => (
            <QuotaProgress key={quota.label} {...quota} />
          ))}
        </CardContent>
      </Card>
      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <ResourceChart />
        <InstanceStatusChart />
      </section>
      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent instances</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {demoRecentInstances.map((instance) => (
              <div key={instance.name} className="grid gap-3 rounded-md border bg-background p-3 text-sm md:grid-cols-[1.2fr_92px_1fr_1fr_80px]">
                <span className="font-medium">{instance.name}</span>
                <StatusBadge status={instance.status} />
                <span className="text-muted-foreground">{instance.flavor}</span>
                <span className="font-mono text-xs text-muted-foreground">{instance.privateIp}</span>
                <span className="text-muted-foreground">{instance.az}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Multipass service health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {demoServiceHealth.map((service) => (
              <div key={service.service} className="grid gap-3 rounded-md border bg-background p-3 text-sm md:grid-cols-[1fr_92px_1.2fr_80px]">
                <span className="font-medium">{service.service}</span>
                <StatusBadge status={service.status} />
                <span className="text-muted-foreground">{service.endpoint}</span>
                <span className="font-mono text-xs text-muted-foreground">{service.latency}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
      <section className="rounded-lg border bg-card p-5">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Activity className="h-4 w-4 text-primary" />
          Recent activity
        </div>
        <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
          <p>11:42 - web-prod-01 reboot completed by admin@opencloud.local.</p>
          <p>11:31 - Bridged network address assigned to api-prod-02.</p>
          <p>10:58 - Volume db-primary-data attached to db-primary-01.</p>
        </div>
      </section>
    </div>
  );
}

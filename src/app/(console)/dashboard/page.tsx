"use client";

import * as React from "react";
import { Activity, Cpu, Database, DollarSign, HardDrive, Network, Server } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectionBadge } from "@/components/ui/connection-badge";
import { LastUpdated } from "@/components/ui/last-updated";
import { QuotaProgress } from "@/components/ui/quota-progress";
import { RefreshButton } from "@/components/ui/refresh-button";
import { StatusBadge } from "@/components/ui/status-badge";

type Instance = {
  name: string;
  state?: string;
  status?: string;
  ipv4?: string[];
  instanceId?: string;
  cpu?: number;
  ramMb?: number;
  storageGb?: number;
};

type DashboardPayload = {
  source?: "local" | "multipass";
  metrics?: Array<{ title: string; value: string; helper: string }>;
  quotas?: Array<{ label: string; used: number; limit: number }>;
  recentInstances?: Instance[];
  recentActivity?: Array<{
    id: string;
    action: string;
    resourceType: string;
    resourceName: string | null;
    status: string;
    safeMessage: string;
    createdAt: string;
  }>;
  services?: Array<{ service: string; status: string; endpoint: string; latency: string }>;
};

export default function DashboardPage() {
  const [payload, setPayload] = React.useState<DashboardPayload>({});
  const [loading, setLoading] = React.useState(true);
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);

  const loadDashboard = React.useCallback(() => {
    setLoading(true);
    fetch("/api/dashboard", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : {})
      .then((data) => {
        setPayload(data);
        setLastUpdated(new Date());
      })
      .catch(() => setPayload({}))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const instances = payload.recentInstances ?? [];
  const metrics = payload.metrics ?? [];
  const quotas = payload.quotas ?? [];
  const services = payload.services ?? [];
  const activity = payload.recentActivity ?? [];
  const metricIcons = [Server, Activity, Server, Activity, Cpu, Cpu, HardDrive, DollarSign, Database, Network];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Current local VM resource overview."
        actions={
          <>
            <LastUpdated value={lastUpdated ?? new Date()} />
            <RefreshButton onRefresh={loadDashboard} disabled={loading} />
            <ConnectionBadge status={payload.source === "multipass" ? "healthy" : "unavailable"} />
          </>
        }
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.title} {...metric} icon={metricIcons[index] ?? Server} />
        ))}
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Quota usage</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {quotas.length === 0 ? (
            <p className="text-sm text-muted-foreground">No quota data available.</p>
          ) : quotas.map((quota) => (
            <QuotaProgress key={quota.label} label={quota.label} used={quota.used} limit={quota.limit} />
          ))}
        </CardContent>
      </Card>
      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent instances</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {instances.length === 0 ? (
              <p className="text-sm text-muted-foreground">Launch an instance to show it here.</p>
            ) : instances.map((instance) => (
              <div key={instance.name} className="grid gap-3 rounded-md border bg-background p-3 text-sm md:grid-cols-[1.2fr_92px_1fr]">
                <span className="font-medium">{instance.name}</span>
                <StatusBadge status={instance.status ?? instance.state ?? "UNKNOWN"} />
                <span className="font-mono text-xs text-muted-foreground">{instance.ipv4?.[0] ?? "-"}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent className="min-h-32 space-y-3 text-sm">
            {activity.length === 0 ? (
              <p className="text-muted-foreground">Create or terminate resources to update this console.</p>
            ) : activity.map((item) => (
              <div key={item.id} className="grid gap-2 rounded-md border bg-background p-3 md:grid-cols-[1fr_92px]">
                <div>
                  <div className="font-medium">{item.safeMessage}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.action} / {item.resourceName ?? item.resourceType}
                  </div>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {services.map((service) => (
            <div key={service.service} className="grid gap-2 rounded-md border bg-background p-3 text-sm md:grid-cols-[1fr_92px]">
              <div>
                <div className="font-medium">{service.service}</div>
                <div className="text-xs text-muted-foreground">{service.endpoint} / {service.latency}</div>
              </div>
              <StatusBadge status={service.status} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

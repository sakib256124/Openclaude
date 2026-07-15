"use client";

import * as React from "react";
import { Activity, Cpu, Database, Network, Server } from "lucide-react";
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
  ipv4?: string[];
  memoryUsage?: string;
};

export default function DashboardPage() {
  const [instances, setInstances] = React.useState<Instance[]>([]);

  React.useEffect(() => {
    fetch("/api/instances", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : { instances: [] })
      .then((data) => setInstances(Array.isArray(data.instances) ? data.instances : []))
      .catch(() => setInstances([]));
  }, []);

  const running = instances.filter((instance) => instance.state === "Running").length;
  const stopped = instances.filter((instance) => instance.state === "Stopped").length;
  const building = instances.filter((instance) => instance.state === "Starting").length;
  const metricIcons = [Server, Activity, Server, Activity, Cpu, Cpu, Database, Network];
  const metrics = [
    { title: "Total Instances", value: String(instances.length), helper: `${running} running, ${stopped} stopped, ${building} building` },
    { title: "Running", value: String(running), helper: "Active workloads" },
    { title: "Stopped", value: String(stopped), helper: "Stopped instances" },
    { title: "Building", value: String(building), helper: "Recently created instances" },
    { title: "Allocated vCPUs", value: instances.length ? String(instances.length * 2) : "0", helper: "Based on created instances" },
    { title: "Allocated RAM", value: instances.length ? `${instances.length * 8} GB` : "0 GB", helper: "Based on launch configuration" },
    { title: "Volume Storage", value: instances.length ? `${instances.length * 80} GB` : "0 GB", helper: "Boot disk total" },
    { title: "Network Addresses", value: String(instances.filter((instance) => instance.ipv4?.length).length), helper: "Assigned addresses" }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Current local VM resource overview."
        actions={
          <>
            <LastUpdated value={new Date()} />
            <RefreshButton />
            <ConnectionBadge status="healthy" />
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
          <QuotaProgress label="Instances" used={instances.length} limit={24} />
          <QuotaProgress label="vCPUs" used={instances.length * 2} limit={96} />
          <QuotaProgress label="RAM" used={instances.length * 8} limit={384} />
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
                <StatusBadge status={instance.state === "Running" ? "ACTIVE" : instance.state ?? "UNKNOWN"} />
                <span className="font-mono text-xs text-muted-foreground">{instance.ipv4?.[0] ?? "-"}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent className="flex min-h-32 items-center text-sm text-muted-foreground">
            Create or terminate resources to update this console.
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

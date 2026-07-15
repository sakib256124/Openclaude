"use client";

import * as React from "react";
import { Activity, Cpu, Database, Network } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ResourceTable } from "@/components/ui/resource-table";

type MetricsPayload = {
  metrics?: {
    cpuUsagePercent: number;
    memoryUsagePercent: number;
    diskUsagePercent: number;
    networkTrafficMbps: number;
    healthyInstances: number;
  };
  instances?: Array<{
    name: string;
    state: string;
    health: string;
    ipv4: string[];
    memoryUsage?: string;
    diskUsage?: string;
  }>;
};

export default function MonitoringPage() {
  const [payload, setPayload] = React.useState<MetricsPayload>({});

  React.useEffect(() => {
    const load = () => {
      fetch("/api/metrics", { cache: "no-store" })
        .then((response) => response.ok ? response.json() : {})
        .then((data) => setPayload(data))
        .catch(() => setPayload({}));
    };

    load();
    const timer = window.setInterval(load, 10_000);
    return () => window.clearInterval(timer);
  }, []);

  const metrics = payload.metrics;
  const instances = payload.instances ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Monitoring" description={`${metrics?.healthyInstances ?? 0} healthy instances`} />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Avg CPU" value={`${metrics?.cpuUsagePercent ?? 0}%`} icon={Cpu} helper="Live Multipass estimate" />
        <MetricCard title="Avg RAM" value={`${metrics?.memoryUsagePercent ?? 0}%`} icon={Activity} helper="Live Multipass estimate" />
        <MetricCard title="Disk usage" value={`${metrics?.diskUsagePercent ?? 0}%`} icon={Database} helper="Boot disk estimate" />
        <MetricCard title="Network In" value={`${metrics?.networkTrafficMbps ?? 0} Mbps`} icon={Network} helper="Address-based estimate" />
      </section>
      <ResourceTable
        columns={[
          { key: "name", label: "Instance" },
          { key: "state", label: "State" },
          { key: "health", label: "Health" },
          { key: "address", label: "Address" },
          { key: "memory", label: "Memory" },
          { key: "disk", label: "Disk" }
        ]}
        rows={instances.map((instance) => [
          instance.name,
          instance.state,
          instance.health,
          instance.ipv4?.[0] ?? "-",
          instance.memoryUsage ?? "-",
          instance.diskUsage ?? "-"
        ])}
        emptyTitle="No monitoring samples"
        emptyDescription="Launch an instance to collect health details."
      />
    </div>
  );
}

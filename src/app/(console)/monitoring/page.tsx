import { PageHeader } from "@/components/layout/page-header";
import { ResourceChart } from "@/components/dashboard/resource-chart";
import { InstanceStatusChart } from "@/components/dashboard/instance-status-chart";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Activity, Cpu, Database, Network } from "lucide-react";

export default function MonitoringPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Monitoring" description="Demo telemetry overview for compute, memory, storage, and network usage." />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Avg CPU" value="62%" icon={Cpu} helper="Across running demo instances" />
        <MetricCard title="Avg RAM" value="54%" icon={Activity} helper="192 GB reserved, 104 GB active" />
        <MetricCard title="Storage I/O" value="1.2k IOPS" icon={Database} helper="Peak during last 15 minutes" />
        <MetricCard title="Network In" value="842 Mbps" icon={Network} helper="Aggregated private + floating traffic" />
      </section>
      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <ResourceChart />
        <InstanceStatusChart />
      </section>
    </div>
  );
}

import { Activity, Cpu, Database, Network } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/dashboard/metric-card";

export default function MonitoringPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Monitoring" description="Metrics appear after local resource collection is available." />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Avg CPU" value="0%" icon={Cpu} helper="No samples collected" />
        <MetricCard title="Avg RAM" value="0%" icon={Activity} helper="No samples collected" />
        <MetricCard title="Storage I/O" value="0 IOPS" icon={Database} helper="No samples collected" />
        <MetricCard title="Network In" value="0 Mbps" icon={Network} helper="No samples collected" />
      </section>
    </div>
  );
}

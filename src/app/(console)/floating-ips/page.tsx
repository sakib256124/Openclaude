import { PageHeader } from "@/components/layout/page-header";
import { ResourceTable } from "@/components/ui/resource-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { demoFloatingIps } from "@/lib/demo-data";

const columns = [
  { key: "floatingIp", label: "Floating IP", sortable: true },
  { key: "instance", label: "Associated instance" },
  { key: "privateIp", label: "Private IP" },
  { key: "status", label: "Status" }
];

export default function FloatingIpsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Floating IPs" description="Demo Neutron allocation, association, disassociation, and release overview." />
      <ResourceTable
        columns={columns}
        rows={demoFloatingIps.map(([floatingIp, instance, privateIp, status]) => [
          <span key={floatingIp} className="font-mono text-xs">{floatingIp}</span>,
          instance,
          <span key={privateIp} className="font-mono text-xs text-muted-foreground">{privateIp}</span>,
          <StatusBadge key={status} status={status} />
        ])}
        emptyTitle="No floating IPs"
        emptyDescription="No demo floating IPs available."
      />
    </div>
  );
}

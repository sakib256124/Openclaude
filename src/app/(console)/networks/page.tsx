import { PageHeader } from "@/components/layout/page-header";
import { ResourceTable } from "@/components/ui/resource-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { demoNetworks } from "@/lib/demo-data";

const columns = [
  { key: "name", label: "Network name", sortable: true },
  { key: "cidr", label: "CIDR" },
  { key: "status", label: "Status" },
  { key: "ports", label: "Ports" },
  { key: "router", label: "Router" }
];

export default function NetworksPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Networks" description="Demo Multipass network, subnet, interface, and connected-resource view." />
      <ResourceTable
        columns={columns}
        rows={demoNetworks.map(([name, cidr, status, ports, router]) => [name, cidr, <StatusBadge key={status} status={status} />, ports, router])}
        emptyTitle="No networks"
        emptyDescription="No demo networks available."
      />
    </div>
  );
}

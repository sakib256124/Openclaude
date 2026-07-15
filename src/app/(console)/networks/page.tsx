import { PageHeader } from "@/components/layout/page-header";
import { LocalResourceManager } from "@/components/resources/local-resource-manager";

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
      <PageHeader title="Networks" description="Create and manage network records." />
      <LocalResourceManager
        storageKey="opencloud:networks"
        title="Create network"
        columns={columns}
        fields={[
          { key: "name", label: "Network name", defaultValue: "private-app-net" },
          { key: "cidr", label: "CIDR", defaultValue: "10.10.1.0/24" },
          { key: "status", label: "Status", defaultValue: "UP" },
          { key: "ports", label: "Ports", defaultValue: "0 ports" },
          { key: "router", label: "Router", defaultValue: "router-main" }
        ]}
        emptyTitle="No networks"
        emptyDescription="Create a network to show it here."
      />
    </div>
  );
}

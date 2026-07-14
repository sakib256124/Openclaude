import { Columns3, Plus, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/ui/filter-bar";
import { ResourceTable } from "@/components/ui/resource-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { demoRecentInstances } from "@/lib/demo-data";

const columns = [
  { key: "select", label: "" },
  { key: "name", label: "Name", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "power", label: "Power State" },
  { key: "image", label: "Image" },
  { key: "flavor", label: "Flavor" },
  { key: "privateIp", label: "Private IP" },
  { key: "floatingIp", label: "Floating IP" },
  { key: "az", label: "Availability Zone" },
  { key: "created", label: "Created", sortable: true },
  { key: "actions", label: "Actions" }
];

export function InstanceTable() {
  const rows = demoRecentInstances.map((instance) => [
    <input key={`${instance.name}-select`} type="checkbox" className="h-4 w-4 rounded border" aria-label={`Select ${instance.name}`} />,
    <span key={`${instance.name}-name`} className="font-medium">{instance.name}</span>,
    <StatusBadge key={`${instance.name}-status`} status={instance.status} />,
    instance.status === "ACTIVE" ? "Running" : instance.status === "SHUTOFF" ? "Stopped" : "Pending",
    instance.name.includes("db") ? "ubuntu-24.04-server" : "debian-12-cloud",
    instance.flavor,
    <span key={`${instance.name}-private`} className="font-mono text-xs text-muted-foreground">{instance.privateIp}</span>,
    instance.name === "worker-batch-01" ? "-" : "203.0.113." + (instance.name === "web-prod-01" ? "21" : instance.name === "api-prod-02" ? "34" : "52"),
    instance.az,
    "2026-07-12",
    <Button key={`${instance.name}-action`} variant="secondary">Actions</Button>
  ]);

  return (
    <div className="space-y-4">
      <FilterBar
        left={
          <>
            <div className="flex h-[42px] min-w-72 items-center gap-2 rounded-md border bg-background px-3 text-sm text-muted-foreground">
              <Search className="h-4 w-4" />
              Search demo instances
            </div>
            {["Status", "Image", "Flavor", "Availability Zone", "Network"].map((filter) => (
              <button key={filter} className="h-[42px] rounded-md border bg-background px-3 text-sm text-muted-foreground" disabled>
                {filter}
              </button>
            ))}
          </>
        }
        right={
          <>
            <Button variant="secondary" disabled>
              <Columns3 />
              Columns
            </Button>
            <Button asChild>
              <Link href="/instances/launch">
                <Plus />
                Launch Instance
              </Link>
            </Button>
          </>
        }
      />
      <ResourceTable
        columns={columns}
        rows={rows}
        emptyTitle="No instances loaded"
        emptyDescription="No demo instances available."
      />
    </div>
  );
}

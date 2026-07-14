import { PageHeader } from "@/components/layout/page-header";
import { ResourceTable } from "@/components/ui/resource-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { demoVolumes } from "@/lib/demo-data";

const columns = [
  { key: "name", label: "Volume name", sortable: true },
  { key: "size", label: "Size" },
  { key: "status", label: "Status" },
  { key: "attached", label: "Attached to" },
  { key: "type", label: "Type" }
];

export default function VolumesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Volumes" description="Demo Cinder block storage listing and attach/detach action state." />
      <ResourceTable
        columns={columns}
        rows={demoVolumes.map(([name, size, status, attached, type]) => [
          name,
          size,
          <StatusBadge key={status} status={status} />,
          attached,
          type
        ])}
        emptyTitle="No volumes"
        emptyDescription="No demo volumes available."
      />
    </div>
  );
}

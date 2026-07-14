import { PageHeader } from "@/components/layout/page-header";
import { ResourceTable } from "@/components/ui/resource-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { demoInstanceSnapshots } from "@/lib/demo-data";

const columns = [
  { key: "name", label: "Snapshot name", sortable: true },
  { key: "source", label: "Source instance" },
  { key: "status", label: "Status" },
  { key: "size", label: "Size" },
  { key: "created", label: "Created", sortable: true }
];

export default function SnapshotsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Snapshots" description="Demo Glance-backed instance snapshots separated from Cinder volume snapshots." />
      <ResourceTable
        columns={columns}
        rows={demoInstanceSnapshots.map(([name, source, status, size, created]) => [
          name,
          source,
          <StatusBadge key={status} status={status} />,
          size,
          created
        ])}
        emptyTitle="No snapshots"
        emptyDescription="No demo snapshots available."
      />
    </div>
  );
}

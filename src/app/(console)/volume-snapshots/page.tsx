import { PageHeader } from "@/components/layout/page-header";
import { ResourceTable } from "@/components/ui/resource-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { demoVolumeSnapshots } from "@/lib/demo-data";

const columns = [
  { key: "name", label: "Snapshot name", sortable: true },
  { key: "volume", label: "Source volume" },
  { key: "status", label: "Status" },
  { key: "size", label: "Size" },
  { key: "created", label: "Created", sortable: true }
];

export default function VolumeSnapshotsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Volume Snapshots" description="Demo Cinder volume snapshots managed separately from Glance instance snapshots." />
      <ResourceTable
        columns={columns}
        rows={demoVolumeSnapshots.map(([name, volume, status, size, created]) => [
          name,
          volume,
          <StatusBadge key={status} status={status} />,
          size,
          created
        ])}
        emptyTitle="No volume snapshots"
        emptyDescription="No demo volume snapshots available."
      />
    </div>
  );
}

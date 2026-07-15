import { PageHeader } from "@/components/layout/page-header";
import { LocalResourceManager } from "@/components/resources/local-resource-manager";

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
      <PageHeader title="Volume Snapshots" description="Create and manage volume snapshots." />
      <LocalResourceManager
        storageKey="opencloud:volume-snapshots"
        title="Create volume snapshot"
        columns={columns}
        fields={[
          { key: "name", label: "Snapshot name", defaultValue: "volume-snapshot" },
          { key: "volume", label: "Source volume", defaultValue: "data-volume" },
          { key: "status", label: "Status", defaultValue: "available" },
          { key: "size", label: "Size", defaultValue: "100 GB" },
          { key: "created", label: "Created", defaultValue: new Date().toISOString().slice(0, 10) }
        ]}
        emptyTitle="No volume snapshots"
        emptyDescription="Create a volume snapshot to show it here."
      />
    </div>
  );
}

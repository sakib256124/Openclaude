import { PageHeader } from "@/components/layout/page-header";
import { LocalResourceManager } from "@/components/resources/local-resource-manager";

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
      <PageHeader title="Snapshots" description="Create and manage instance snapshots." />
      <LocalResourceManager
        storageKey="opencloud:snapshots"
        title="Create snapshot"
        columns={columns}
        fields={[
          { key: "name", label: "Snapshot name", defaultValue: "instance-snapshot" },
          { key: "source", label: "Source instance", defaultValue: "web-app-01" },
          { key: "status", label: "Status", defaultValue: "ACTIVE" },
          { key: "size", label: "Size", defaultValue: "22.6 GB" },
          { key: "created", label: "Created", defaultValue: new Date().toISOString().slice(0, 10) }
        ]}
        emptyTitle="No snapshots"
        emptyDescription="Create a snapshot to show it here."
      />
    </div>
  );
}

import { PageHeader } from "@/components/layout/page-header";
import { LocalResourceManager } from "@/components/resources/local-resource-manager";

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
      <PageHeader title="Volumes" description="Create and manage volumes." />
      <LocalResourceManager
        storageKey="opencloud:volumes"
        title="Create volume"
        columns={columns}
        fields={[
          { key: "name", label: "Volume name", defaultValue: "data-volume" },
          { key: "size", label: "Size", defaultValue: "100 GB" },
          { key: "status", label: "Status", defaultValue: "available" },
          { key: "attached", label: "Attached to", defaultValue: "-" },
          { key: "type", label: "Type", defaultValue: "standard" }
        ]}
        emptyTitle="No volumes"
        emptyDescription="Create a volume to show it here."
      />
    </div>
  );
}

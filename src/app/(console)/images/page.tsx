import { PageHeader } from "@/components/layout/page-header";
import { LocalResourceManager } from "@/components/resources/local-resource-manager";

const columns = [
  { key: "name", label: "Image name", sortable: true },
  { key: "os", label: "OS" },
  { key: "status", label: "Status" },
  { key: "size", label: "Size" },
  { key: "updated", label: "Updated", sortable: true }
];

export default function ImagesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Images" description="Create and manage image records." />
      <LocalResourceManager
        storageKey="opencloud:images"
        title="Create image"
        columns={columns}
        fields={[
          { key: "name", label: "Image name", defaultValue: "ubuntu-24.04-server" },
          { key: "os", label: "OS", defaultValue: "Ubuntu 24.04 LTS" },
          { key: "status", label: "Status", defaultValue: "ACTIVE" },
          { key: "size", label: "Size", defaultValue: "22.4 GB" },
          { key: "updated", label: "Updated", defaultValue: new Date().toISOString().slice(0, 10) }
        ]}
        emptyTitle="No images"
        emptyDescription="Create an image to show it here."
      />
    </div>
  );
}

import { PageHeader } from "@/components/layout/page-header";
import { ResourceTable } from "@/components/ui/resource-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { demoImages } from "@/lib/demo-data";

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
      <PageHeader title="Images" description="Demo Multipass image inventory with filters, metadata, and selection safety." />
      <ResourceTable
        columns={columns}
        rows={demoImages.map(([name, os, status, size, updated]) => [name, os, <StatusBadge key={status} status={status} />, size, updated])}
        emptyTitle="No images"
        emptyDescription="No demo images available."
      />
    </div>
  );
}

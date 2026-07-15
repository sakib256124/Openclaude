import { PageHeader } from "@/components/layout/page-header";
import { ApiResourceManager } from "@/components/resources/api-resource-manager";

export default function VolumesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Volumes" description="Create and manage volumes." />
      <ApiResourceManager resource="volumes" />
    </div>
  );
}

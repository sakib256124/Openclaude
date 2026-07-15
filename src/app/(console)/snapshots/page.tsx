import { PageHeader } from "@/components/layout/page-header";
import { ApiResourceManager } from "@/components/resources/api-resource-manager";

export default function SnapshotsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Snapshots" description="Create and manage instance snapshots." />
      <ApiResourceManager resource="snapshots" />
    </div>
  );
}

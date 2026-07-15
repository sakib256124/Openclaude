import { PageHeader } from "@/components/layout/page-header";
import { ApiResourceManager } from "@/components/resources/api-resource-manager";

export default function VolumeSnapshotsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Volume Snapshots" description="Create and manage volume snapshots." />
      <ApiResourceManager resource="volumeSnapshots" />
    </div>
  );
}

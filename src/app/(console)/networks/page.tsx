import { PageHeader } from "@/components/layout/page-header";
import { ApiResourceManager } from "@/components/resources/api-resource-manager";

export default function NetworksPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Networks" description="Create and manage network records." />
      <ApiResourceManager resource="networks" />
    </div>
  );
}

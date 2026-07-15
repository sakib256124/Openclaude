import { PageHeader } from "@/components/layout/page-header";
import { ApiResourceManager } from "@/components/resources/api-resource-manager";

export default function KeyPairsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Key Pairs" description="Create, import, and manage key pairs." />
      <ApiResourceManager resource="keyPairs" />
    </div>
  );
}

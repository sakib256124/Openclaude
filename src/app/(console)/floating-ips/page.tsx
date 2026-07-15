import { PageHeader } from "@/components/layout/page-header";
import { ApiResourceManager } from "@/components/resources/api-resource-manager";

export default function FloatingIpsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Addresses" description="Create, associate, and release address records." />
      <ApiResourceManager resource="floatingIps" />
    </div>
  );
}

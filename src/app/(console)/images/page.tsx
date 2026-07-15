import { PageHeader } from "@/components/layout/page-header";
import { ApiResourceManager } from "@/components/resources/api-resource-manager";

export default function ImagesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Images" description="Create and manage image records." />
      <ApiResourceManager resource="images" />
    </div>
  );
}

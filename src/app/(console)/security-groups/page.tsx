import { PageHeader } from "@/components/layout/page-header";
import { ApiResourceManager } from "@/components/resources/api-resource-manager";

export default function SecurityGroupsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Security groups" description="Create and manage firewall groups." />
      <ApiResourceManager resource="securityGroups" />
    </div>
  );
}

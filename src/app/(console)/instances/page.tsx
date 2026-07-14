import { InstanceTable } from "@/components/instances/instance-table";
import { PageHeader } from "@/components/layout/page-header";

export default function InstancesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Instances" description="Server listing will call Nova through protected API routes." />
      <InstanceTable />
    </div>
  );
}

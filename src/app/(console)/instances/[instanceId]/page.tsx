import { InstanceDetails } from "@/components/instances/instance-details";
import { PageHeader } from "@/components/layout/page-header";

export default async function InstanceDetailsPage({
  params
}: {
  params: Promise<{ instanceId: string }>;
}) {
  const { instanceId } = await params;
  return (
    <div className="space-y-6">
      <PageHeader title="Instance details" description={`Instance ${instanceId}`} />
      <InstanceDetails instanceId={instanceId} />
    </div>
  );
}

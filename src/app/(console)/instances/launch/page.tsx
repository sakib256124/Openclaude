import { LaunchInstanceForm } from "@/components/instances/launch-instance-form";
import { PageHeader } from "@/components/layout/page-header";

export default function LaunchInstancePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Launch instance" description="Demo launch workflow with selected image, flavor, network, key pair, security group, storage, and quota impact." />
      <LaunchInstanceForm />
    </div>
  );
}

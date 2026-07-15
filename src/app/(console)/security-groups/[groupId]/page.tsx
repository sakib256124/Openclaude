import { PageHeader } from "@/components/layout/page-header";
import { ResourceTable } from "@/components/ui/resource-table";

const columns = [
  { key: "direction", label: "Direction" },
  { key: "protocol", label: "Protocol" },
  { key: "port", label: "Port range" },
  { key: "remote", label: "Remote" },
  { key: "description", label: "Description" }
];

const rows = [
  ["Ingress", "TCP", "22", "203.0.113.0/24", "SSH from office VPN"],
  ["Ingress", "TCP", "80", "0.0.0.0/0", "HTTP public traffic"],
  ["Ingress", "TCP", "443", "0.0.0.0/0", "HTTPS public traffic"],
  ["Egress", "Any", "All", "0.0.0.0/0", "Outbound access"]
];

export default async function SecurityGroupDetailsPage({
  params
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  return (
    <div className="space-y-6">
      <PageHeader title="Security group details" description={`Security group ${groupId}`} />
      <ResourceTable columns={columns} rows={rows} emptyTitle="No rules" emptyDescription="Create security group rules to show them here." />
    </div>
  );
}

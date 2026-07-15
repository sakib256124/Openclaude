import { PageHeader } from "@/components/layout/page-header";
import { LocalResourceManager } from "@/components/resources/local-resource-manager";

const columns = [
  { key: "name", label: "Group name", sortable: true },
  { key: "rules", label: "Allowed traffic" },
  { key: "ruleCount", label: "Rules" },
  { key: "attached", label: "Attached to" }
];

export default function SecurityGroupsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Security groups" description="Create and manage firewall groups." />
      <LocalResourceManager
        storageKey="opencloud:security-groups"
        title="Create security group"
        columns={columns}
        emptyTitle="No security groups"
        emptyDescription="Create a security group to show it here."
        fields={[
          { key: "name", label: "Group name", defaultValue: "web-sg" },
          { key: "rules", label: "Allowed traffic", defaultValue: "HTTP, HTTPS, SSH" },
          { key: "ruleCount", label: "Rules", defaultValue: "0 rules" },
          { key: "attached", label: "Attached to", defaultValue: "0 instances" }
        ]}
      />
    </div>
  );
}

import { PageHeader } from "@/components/layout/page-header";
import { ResourceTable } from "@/components/ui/resource-table";
import { demoSecurityGroups } from "@/lib/demo-data";

const columns = [
  { key: "name", label: "Group name", sortable: true },
  { key: "rules", label: "Allowed traffic" },
  { key: "ruleCount", label: "Rules" },
  { key: "attached", label: "Attached to" }
];

export default function SecurityGroupsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Security groups" description="Demo firewall rules, presets, and sensitive-port warnings." />
      <ResourceTable
        columns={columns}
        rows={demoSecurityGroups}
        emptyTitle="No security groups"
        emptyDescription="No demo security groups available."
      />
    </div>
  );
}

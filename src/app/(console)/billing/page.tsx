import { PageHeader } from "@/components/layout/page-header";
import { ResourceTable } from "@/components/ui/resource-table";

const columns = [
  { key: "service", label: "Service", sortable: true },
  { key: "cost", label: "Estimated cost" },
  { key: "usage", label: "Usage" },
  { key: "note", label: "Note" }
];

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Billing" description="Estimated costs appear after resources are created." />
      <ResourceTable columns={columns} rows={[]} emptyTitle="No billing rows" emptyDescription="Create resources to calculate billing rows." />
    </div>
  );
}

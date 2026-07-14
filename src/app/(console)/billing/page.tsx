import { PageHeader } from "@/components/layout/page-header";
import { ResourceTable } from "@/components/ui/resource-table";
import { demoBilling } from "@/lib/demo-data";

const columns = [
  { key: "service", label: "Service", sortable: true },
  { key: "cost", label: "Estimated cost" },
  { key: "usage", label: "Usage" },
  { key: "note", label: "Note" }
];

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Billing" description="Demo estimated cost based on local pricing rules, not official provider invoices." />
      <ResourceTable columns={columns} rows={demoBilling} emptyTitle="No billing rows" emptyDescription="No demo billing values available." />
    </div>
  );
}

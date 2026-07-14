import { PageHeader } from "@/components/layout/page-header";
import { ResourceTable } from "@/components/ui/resource-table";
import { demoKeyPairs } from "@/lib/demo-data";

const columns = [
  { key: "name", label: "Key name", sortable: true },
  { key: "type", label: "Type" },
  { key: "fingerprint", label: "Fingerprint" },
  { key: "created", label: "Created", sortable: true }
];

export default function KeyPairsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Key Pairs" description="Demo key pair listing, import, creation, and one-time private-key delivery flow." />
      <ResourceTable columns={columns} rows={demoKeyPairs} emptyTitle="No key pairs" emptyDescription="No demo key pairs available." />
    </div>
  );
}

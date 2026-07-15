import { PageHeader } from "@/components/layout/page-header";
import { LocalResourceManager } from "@/components/resources/local-resource-manager";

const columns = [
  { key: "name", label: "Key name", sortable: true },
  { key: "type", label: "Type" },
  { key: "fingerprint", label: "Fingerprint" },
  { key: "created", label: "Created", sortable: true }
];

export default function KeyPairsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Key Pairs" description="Create, import, and manage key pairs." />
      <LocalResourceManager
        storageKey="opencloud:key-pairs"
        title="Create key pair"
        columns={columns}
        fields={[
          { key: "name", label: "Key name", defaultValue: "opencloud-key" },
          { key: "type", label: "Type", defaultValue: "ssh-ed25519" },
          { key: "fingerprint", label: "Fingerprint", defaultValue: "SHA256:local" },
          { key: "created", label: "Created", defaultValue: new Date().toISOString().slice(0, 10) }
        ]}
        emptyTitle="No key pairs"
        emptyDescription="Create a key pair to show it here."
      />
    </div>
  );
}

import { PageHeader } from "@/components/layout/page-header";
import { LocalResourceManager } from "@/components/resources/local-resource-manager";

const columns = [
  { key: "address", label: "Address", sortable: true },
  { key: "instance", label: "Associated instance" },
  { key: "privateIp", label: "Private IP" },
  { key: "status", label: "Status" }
];

export default function FloatingIpsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Addresses" description="Create, associate, and release address records." />
      <LocalResourceManager
        storageKey="opencloud:addresses"
        title="Allocate address"
        columns={columns}
        fields={[
          { key: "address", label: "Address", defaultValue: "10.10.9.50" },
          { key: "instance", label: "Associated instance", defaultValue: "-" },
          { key: "privateIp", label: "Private IP", defaultValue: "-" },
          { key: "status", label: "Status", defaultValue: "RESERVED" }
        ]}
        deleteLabel="Release"
        emptyTitle="No addresses"
        emptyDescription="Allocate an address to show it here."
      />
    </div>
  );
}

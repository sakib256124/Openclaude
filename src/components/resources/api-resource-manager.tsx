"use client";

import * as React from "react";
import { Link2, Plus, RefreshCw, ShieldPlus, Trash2, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResourceTable, type ResourceColumn } from "@/components/ui/resource-table";
import { StatusBadge } from "@/components/ui/status-badge";

type ResourceKind =
  | "images"
  | "keyPairs"
  | "networks"
  | "securityGroups"
  | "floatingIps"
  | "volumes"
  | "snapshots"
  | "volumeSnapshots";

type Field = {
  key: string;
  label: string;
  defaultValue?: string;
  type?: "text" | "number";
  optional?: boolean;
};

type Row = Record<string, unknown>;

type ResourceConfig = {
  title: string;
  createTitle: string;
  endpoint: string;
  collectionKey: string;
  columns: ResourceColumn[];
  fields: Field[];
  emptyTitle: string;
  emptyDescription: string;
  idKey: string;
  buildCreatePayload: (form: Record<string, string>) => Record<string, unknown>;
  rowCells: (row: Row) => React.ReactNode[];
  deletePath?: (row: Row) => string;
  deleteLabel?: string;
  extraActions?: (row: Row, helpers: { reload: () => Promise<void>; setMessage: (value: string) => void }) => React.ReactNode;
};

function value(row: Row, key: string) {
  const current = row[key];
  return current === null || current === undefined || current === "" ? "-" : String(current);
}

function dateValue(row: Row, key = "createdAt") {
  const current = row[key];

  if (!current) {
    return "-";
  }

  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(String(current)));
}

function statusCell(status: unknown) {
  return <StatusBadge status={String(status ?? "UNKNOWN")} />;
}

function configs(): Record<ResourceKind, ResourceConfig> {
  return {
    images: {
      title: "Images",
      createTitle: "Create image",
      endpoint: "/api/images",
      collectionKey: "images",
      idKey: "imageId",
      columns: [
        { key: "imageId", label: "Image ID" },
        { key: "name", label: "Image name", sortable: true },
        { key: "os", label: "OS" },
        { key: "status", label: "Status" },
        { key: "version", label: "Version" },
        { key: "created", label: "Created", sortable: true },
        { key: "actions", label: "Actions" }
      ],
      fields: [
        { key: "name", label: "Image name", defaultValue: "ubuntu-custom-image" },
        { key: "operatingSystem", label: "OS", defaultValue: "Ubuntu" },
        { key: "version", label: "Version", defaultValue: "24.04", optional: true },
        { key: "description", label: "Description", defaultValue: "Custom image", optional: true }
      ],
      emptyTitle: "No images",
      emptyDescription: "Create an image to show it here.",
      buildCreatePayload: (form) => form,
      rowCells: (row) => [value(row, "imageId"), value(row, "name"), value(row, "operatingSystem"), statusCell(row.status), value(row, "version"), dateValue(row)],
      deletePath: (row) => `/api/images/${encodeURIComponent(value(row, "imageId"))}`
    },
    keyPairs: {
      title: "Key Pairs",
      createTitle: "Create key pair",
      endpoint: "/api/keypairs",
      collectionKey: "keyPairs",
      idKey: "keyPairId",
      columns: [
        { key: "keyPairId", label: "Key ID" },
        { key: "name", label: "Key name", sortable: true },
        { key: "type", label: "Type" },
        { key: "fingerprint", label: "Fingerprint" },
        { key: "created", label: "Created", sortable: true },
        { key: "actions", label: "Actions" }
      ],
      fields: [
        { key: "name", label: "Key name", defaultValue: "opencloud-key" },
        { key: "type", label: "Type", defaultValue: "ssh-ed25519" },
        { key: "publicKey", label: "Public key", optional: true }
      ],
      emptyTitle: "No key pairs",
      emptyDescription: "Create a key pair to show it here.",
      buildCreatePayload: (form) => ({ name: form.name, type: form.type, publicKey: form.publicKey || undefined }),
      rowCells: (row) => [value(row, "keyPairId"), value(row, "name"), value(row, "type"), value(row, "fingerprint"), dateValue(row)],
      deletePath: (row) => `/api/keypairs/${encodeURIComponent(value(row, "keyPairId"))}`
    },
    networks: {
      title: "Networks",
      createTitle: "Create network",
      endpoint: "/api/networks",
      collectionKey: "networks",
      idKey: "networkId",
      columns: [
        { key: "networkId", label: "Network ID" },
        { key: "name", label: "Network name", sortable: true },
        { key: "cidr", label: "CIDR" },
        { key: "status", label: "Status" },
        { key: "subnets", label: "Subnets" },
        { key: "created", label: "Created", sortable: true },
        { key: "actions", label: "Actions" }
      ],
      fields: [
        { key: "name", label: "Network name", defaultValue: "private-app-net" },
        { key: "cidr", label: "CIDR", defaultValue: "10.10.1.0/24" },
        { key: "subnetCidr", label: "Subnet CIDR", defaultValue: "10.10.1.0/24", optional: true },
        { key: "description", label: "Description", defaultValue: "Application network", optional: true }
      ],
      emptyTitle: "No networks",
      emptyDescription: "Create a network to show it here.",
      buildCreatePayload: (form) => form,
      rowCells: (row) => [
        value(row, "networkId"),
        value(row, "name"),
        value(row, "cidr"),
        statusCell(row.status),
        Array.isArray(row.subnets) ? `${row.subnets.length} subnets` : "0 subnets",
        dateValue(row)
      ],
      deletePath: (row) => `/api/networks/${encodeURIComponent(value(row, "networkId"))}`
    },
    securityGroups: {
      title: "Security Groups",
      createTitle: "Create security group",
      endpoint: "/api/security-groups",
      collectionKey: "securityGroups",
      idKey: "groupId",
      columns: [
        { key: "groupId", label: "Group ID" },
        { key: "name", label: "Group name", sortable: true },
        { key: "rules", label: "Rules" },
        { key: "description", label: "Description" },
        { key: "created", label: "Created", sortable: true },
        { key: "actions", label: "Actions" }
      ],
      fields: [
        { key: "name", label: "Group name", defaultValue: "web-sg" },
        { key: "description", label: "Description", defaultValue: "SSH, HTTP, HTTPS access", optional: true }
      ],
      emptyTitle: "No security groups",
      emptyDescription: "Create a security group to show it here.",
      buildCreatePayload: (form) => form,
      rowCells: (row) => [value(row, "groupId"), value(row, "name"), Array.isArray(row.rules) ? `${row.rules.length} rules` : "0 rules", value(row, "description"), dateValue(row)],
      deletePath: (row) => `/api/security-groups/${encodeURIComponent(value(row, "groupId"))}`,
      extraActions: (row, helpers) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={async () => {
            const port = window.prompt("Port to allow", "22");

            if (!port) {
              return;
            }

            const response = await fetch(`/api/security-groups/${encodeURIComponent(value(row, "groupId"))}/rules`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ protocol: "TCP", fromPort: Number(port), toPort: Number(port), cidr: "0.0.0.0/0" })
            });

            helpers.setMessage(response.ok ? "Firewall rule added." : "Failed to add firewall rule.");
            await helpers.reload();
          }}
        >
          <ShieldPlus />
          Rule
        </Button>
      )
    },
    floatingIps: {
      title: "Addresses",
      createTitle: "Allocate address",
      endpoint: "/api/floating-ips",
      collectionKey: "floatingIps",
      idKey: "allocationId",
      columns: [
        { key: "allocationId", label: "Allocation ID" },
        { key: "publicIp", label: "Address", sortable: true },
        { key: "status", label: "Status" },
        { key: "instance", label: "Associated instance" },
        { key: "created", label: "Created", sortable: true },
        { key: "actions", label: "Actions" }
      ],
      fields: [{ key: "publicIp", label: "Address", optional: true }],
      emptyTitle: "No addresses",
      emptyDescription: "Allocate an address to show it here.",
      buildCreatePayload: (form) => ({ publicIp: form.publicIp || undefined }),
      rowCells: (row) => [value(row, "allocationId"), value(row, "publicIp"), statusCell(row.status), row.instance && typeof row.instance === "object" ? value(row.instance as Row, "name") : "-", dateValue(row)],
      deletePath: (row) => `/api/floating-ips/${encodeURIComponent(value(row, "allocationId"))}`,
      deleteLabel: "Release",
      extraActions: (row, helpers) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={async () => {
            const instanceId = window.prompt("Instance name or ID to associate. Leave blank to disassociate.", "");
            const response = await fetch(`/api/floating-ips/${encodeURIComponent(value(row, "allocationId"))}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ instanceId: instanceId || null })
            });

            helpers.setMessage(response.ok ? "Address association updated." : "Failed to update address.");
            await helpers.reload();
          }}
        >
          <Link2 />
          Associate
        </Button>
      )
    },
    volumes: {
      title: "Volumes",
      createTitle: "Create volume",
      endpoint: "/api/volumes",
      collectionKey: "volumes",
      idKey: "volumeId",
      columns: [
        { key: "volumeId", label: "Volume ID" },
        { key: "name", label: "Volume name", sortable: true },
        { key: "size", label: "Size" },
        { key: "status", label: "Status" },
        { key: "attached", label: "Attached to" },
        { key: "created", label: "Created", sortable: true },
        { key: "actions", label: "Actions" }
      ],
      fields: [
        { key: "name", label: "Volume name", defaultValue: "data-volume" },
        { key: "sizeGb", label: "Size GB", defaultValue: "20", type: "number" }
      ],
      emptyTitle: "No volumes",
      emptyDescription: "Create a volume to show it here.",
      buildCreatePayload: (form) => ({ name: form.name, sizeGb: Number(form.sizeGb) }),
      rowCells: (row) => [value(row, "volumeId"), value(row, "name"), `${value(row, "sizeGb")} GB`, statusCell(row.status), row.attachedInstance && typeof row.attachedInstance === "object" ? value(row.attachedInstance as Row, "name") : "-", dateValue(row)],
      deletePath: (row) => `/api/volumes/${encodeURIComponent(value(row, "volumeId"))}`,
      extraActions: (row, helpers) => (
        <>
          <Button
            size="sm"
            variant="secondary"
            onClick={async () => {
              const instanceId = window.prompt("Instance name or ID to attach");

              if (!instanceId) {
                return;
              }

              const response = await fetch(`/api/volumes/${encodeURIComponent(value(row, "volumeId"))}/attach`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ instanceId })
              });

              helpers.setMessage(response.ok ? "Volume attached." : "Failed to attach volume.");
              await helpers.reload();
            }}
          >
            <Link2 />
            Attach
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={async () => {
              const response = await fetch(`/api/volumes/${encodeURIComponent(value(row, "volumeId"))}/detach`, { method: "POST" });
              helpers.setMessage(response.ok ? "Volume detached." : "Failed to detach volume.");
              await helpers.reload();
            }}
          >
            <Unlink />
            Detach
          </Button>
        </>
      )
    },
    snapshots: {
      title: "Snapshots",
      createTitle: "Create snapshot",
      endpoint: "/api/snapshots",
      collectionKey: "snapshots",
      idKey: "snapshotId",
      columns: [
        { key: "snapshotId", label: "Snapshot ID" },
        { key: "name", label: "Snapshot name", sortable: true },
        { key: "status", label: "Status" },
        { key: "size", label: "Size" },
        { key: "source", label: "Source" },
        { key: "created", label: "Created", sortable: true },
        { key: "actions", label: "Actions" }
      ],
      fields: [
        { key: "name", label: "Snapshot name", defaultValue: "instance-snapshot" },
        { key: "instanceId", label: "Source instance name or ID", defaultValue: "web-app-01" },
        { key: "sizeGb", label: "Size GB", defaultValue: "20", type: "number", optional: true }
      ],
      emptyTitle: "No snapshots",
      emptyDescription: "Create a snapshot to show it here.",
      buildCreatePayload: (form) => ({ name: form.name, instanceId: form.instanceId, sizeGb: form.sizeGb ? Number(form.sizeGb) : undefined }),
      rowCells: (row) => [value(row, "snapshotId"), value(row, "name"), statusCell(row.status), `${value(row, "sizeGb")} GB`, row.sourceInstance && typeof row.sourceInstance === "object" ? value(row.sourceInstance as Row, "name") : value(row, "sourceInstanceId"), dateValue(row)],
      deletePath: (row) => `/api/snapshots/${encodeURIComponent(value(row, "snapshotId"))}`
    },
    volumeSnapshots: {
      title: "Volume Snapshots",
      createTitle: "Create volume snapshot",
      endpoint: "/api/snapshots",
      collectionKey: "snapshots",
      idKey: "snapshotId",
      columns: [
        { key: "snapshotId", label: "Snapshot ID" },
        { key: "name", label: "Snapshot name", sortable: true },
        { key: "status", label: "Status" },
        { key: "size", label: "Size" },
        { key: "volume", label: "Source volume" },
        { key: "created", label: "Created", sortable: true },
        { key: "actions", label: "Actions" }
      ],
      fields: [
        { key: "name", label: "Snapshot name", defaultValue: "volume-snapshot" },
        { key: "volumeId", label: "Source volume name or ID", defaultValue: "data-volume" },
        { key: "sizeGb", label: "Size GB", defaultValue: "20", type: "number", optional: true }
      ],
      emptyTitle: "No volume snapshots",
      emptyDescription: "Create a volume snapshot to show it here.",
      buildCreatePayload: (form) => ({ name: form.name, volumeId: form.volumeId, sizeGb: form.sizeGb ? Number(form.sizeGb) : undefined }),
      rowCells: (row) => [value(row, "snapshotId"), value(row, "name"), statusCell(row.status), `${value(row, "sizeGb")} GB`, row.volume && typeof row.volume === "object" ? value(row.volume as Row, "name") : value(row, "volumeId"), dateValue(row)],
      deletePath: (row) => `/api/snapshots/${encodeURIComponent(value(row, "snapshotId"))}`
    }
  };
}

export function ApiResourceManager({ resource }: { resource: ResourceKind }) {
  const config = configs()[resource];
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [pending, setPending] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(config.fields.map((field) => [field.key, field.defaultValue ?? ""]))
  );

  const reload = React.useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch(config.endpoint, { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      setRows(Array.isArray(payload[config.collectionKey]) ? payload[config.collectionKey] : []);
    } catch {
      setRows([]);
      setMessage("Unable to load resources.");
    } finally {
      setLoading(false);
    }
  }, [config.collectionKey, config.endpoint]);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  async function createResource(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending("create");
    setMessage(null);

    try {
      const response = await fetch(config.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config.buildCreatePayload(form))
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(payload.error?.message ?? "Create failed.");
        return;
      }

      setMessage("Resource created successfully.");
      await reload();
    } finally {
      setPending(null);
    }
  }

  async function deleteResource(row: Row) {
    if (!config.deletePath) {
      return;
    }

    const id = value(row, config.idKey);

    if (!window.confirm(`${config.deleteLabel ?? "Delete"} ${id}?`)) {
      return;
    }

    setPending(id);
    setMessage(null);

    try {
      const response = await fetch(config.deletePath(row), { method: "DELETE" });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(payload.error?.message ?? "Delete failed.");
        return;
      }

      setMessage(`${config.deleteLabel ?? "Delete"} completed.`);
      await reload();
    } finally {
      setPending(null);
    }
  }

  const tableRows = rows.map((row) => [
    ...config.rowCells(row),
    <div key={`${value(row, config.idKey)}-actions`} className="flex flex-wrap gap-2">
      {config.extraActions?.(row, { reload, setMessage })}
      {config.deletePath ? (
        <Button
          size="sm"
          variant="destructive"
          disabled={pending === value(row, config.idKey)}
          onClick={() => void deleteResource(row)}
        >
          <Trash2 />
          {pending === value(row, config.idKey) ? "Working" : config.deleteLabel ?? "Delete"}
        </Button>
      ) : null}
    </div>
  ]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{config.createTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-3 xl:grid-cols-4" onSubmit={createResource}>
            {config.fields.map((field) => (
              <label key={field.key} className="space-y-2 text-sm font-medium">
                <span>{field.label}</span>
                <input
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  required={!field.optional}
                  type={field.type ?? "text"}
                  value={form[field.key] ?? ""}
                  onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
                />
              </label>
            ))}
            <div className="flex items-end gap-2">
              <Button className="flex-1" type="submit" disabled={pending === "create"}>
                <Plus />
                {pending === "create" ? "Creating" : "Create"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => void reload()} disabled={loading}>
                <RefreshCw />
              </Button>
            </div>
          </form>
          {message ? <div className="mt-3 text-sm text-muted-foreground">{message}</div> : null}
        </CardContent>
      </Card>
      <ResourceTable
        columns={config.columns}
        rows={tableRows}
        loading={loading}
        emptyTitle={config.emptyTitle}
        emptyDescription={config.emptyDescription}
      />
    </div>
  );
}

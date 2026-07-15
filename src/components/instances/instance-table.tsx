"use client";

import * as React from "react";
import { Columns3, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/ui/filter-bar";
import { ResourceTable } from "@/components/ui/resource-table";
import { StatusBadge } from "@/components/ui/status-badge";

type InstanceRow = {
  name: string;
  status: string;
  flavor: string;
  privateIp: string;
  az: string;
  image?: string;
  created?: string;
};

const columns = [
  { key: "select", label: "" },
  { key: "name", label: "Name", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "power", label: "Power State" },
  { key: "image", label: "Image" },
  { key: "flavor", label: "Flavor" },
  { key: "privateIp", label: "Private IP" },
  { key: "floatingIp", label: "Address" },
  { key: "az", label: "Availability Zone" },
  { key: "created", label: "Created", sortable: true },
  { key: "actions", label: "Actions" }
];

function statusFromState(state: string) {
  if (state === "Running") {
    return "ACTIVE";
  }

  if (state === "Stopped") {
    return "SHUTOFF";
  }

  if (state === "Starting") {
    return "BUILD";
  }

  return state.toUpperCase();
}

export function InstanceTable() {
  const [instances, setInstances] = React.useState<InstanceRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionPending, setActionPending] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    async function loadInstances() {
      try {
        const response = await fetch("/api/instances", { cache: "no-store" });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        const rows = Array.isArray(data.instances)
          ? data.instances.map((instance: {
              name: string;
              state?: string;
              ipv4?: string[];
              release?: string;
              imageHash?: string;
              memoryUsage?: string;
            }) => ({
              name: instance.name,
              status: statusFromState(instance.state ?? "Unknown"),
              flavor: instance.memoryUsage ? `2c-${instance.memoryUsage}` : "m1.medium",
              privateIp: instance.ipv4?.[0] ?? "-",
              az: data.source === "local" ? "local" : "multipass",
              image: instance.release ?? instance.imageHash ?? "ubuntu-24.04-server",
              created: "Just now"
            }))
          : [];

        if (mounted) {
          setInstances(rows);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadInstances();

    return () => {
      mounted = false;
    };
  }, []);

  async function terminateInstance(name: string) {
    setActionPending(name);

    try {
      const response = await fetch(`/api/instances/${encodeURIComponent(name)}`, {
        method: "DELETE"
      });

      if (response.ok) {
        setInstances((current) => current.filter((instance) => instance.name !== name));
      }
    } finally {
      setActionPending(null);
    }
  }

  const rows = instances.map((instance) => [
    <input key={`${instance.name}-select`} type="checkbox" className="h-4 w-4 rounded border" aria-label={`Select ${instance.name}`} />,
    <span key={`${instance.name}-name`} className="font-medium">{instance.name}</span>,
    <StatusBadge key={`${instance.name}-status`} status={instance.status} />,
    instance.status === "ACTIVE" ? "Running" : instance.status === "SHUTOFF" ? "Stopped" : "Pending",
    instance.image ?? "ubuntu-24.04-server",
    instance.flavor,
    <span key={`${instance.name}-private`} className="font-mono text-xs text-muted-foreground">{instance.privateIp}</span>,
    instance.privateIp === "-" ? "-" : instance.privateIp,
    instance.az,
    instance.created ?? "2026-07-12",
    <Button
      key={`${instance.name}-action`}
      disabled={actionPending === instance.name}
      variant="destructive"
      size="sm"
      onClick={() => terminateInstance(instance.name)}
    >
      <Trash2 />
      {actionPending === instance.name ? "Terminating" : "Terminate"}
    </Button>
  ]);

  return (
    <div className="space-y-4">
      <FilterBar
        left={
          <>
            <div className="flex h-[42px] min-w-72 items-center gap-2 rounded-md border bg-background px-3 text-sm text-muted-foreground">
              <Search className="h-4 w-4" />
              Search instances
            </div>
            {["Status", "Image", "Flavor", "Availability Zone", "Network"].map((filter) => (
              <button key={filter} className="h-[42px] rounded-md border bg-background px-3 text-sm text-muted-foreground" disabled>
                {filter}
              </button>
            ))}
          </>
        }
        right={
          <>
            <Button variant="secondary" disabled>
              <Columns3 />
              Columns
            </Button>
            <Button asChild>
              <Link href="/instances/launch">
                <Plus />
                Launch Instance
              </Link>
            </Button>
          </>
        }
      />
      <ResourceTable
        columns={columns}
        rows={rows}
        loading={loading}
        emptyTitle="No instances loaded"
        emptyDescription="Launch an instance to show it here."
      />
    </div>
  );
}

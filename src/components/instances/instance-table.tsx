"use client";

import * as React from "react";
import { Play, Plus, Power, RefreshCw, RotateCw, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/ui/filter-bar";
import { ResourceTable } from "@/components/ui/resource-table";
import { StatusBadge } from "@/components/ui/status-badge";

type InstanceRow = {
  name: string;
  instanceId?: string;
  status: string;
  flavor: string;
  privateIp: string;
  az: string;
  network: string;
  image?: string;
  created?: string;
  cpu?: number;
  ramMb?: number;
  storageGb?: number;
};

const columns = [
  { key: "select", label: "" },
  { key: "name", label: "Name", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "power", label: "Power State" },
  { key: "image", label: "Image", sortable: true },
  { key: "flavor", label: "Flavor", sortable: true },
  { key: "privateIp", label: "Private IP" },
  { key: "floatingIp", label: "Address" },
  { key: "az", label: "Availability Zone", sortable: true },
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
  const [search, setSearch] = React.useState("");
  const [filters, setFilters] = React.useState({
    status: "",
    image: "",
    flavor: "",
    az: "",
    network: ""
  });
  const [sort, setSort] = React.useState<{ key: keyof InstanceRow; direction: "asc" | "desc" }>({
    key: "created",
    direction: "desc"
  });

  const loadInstances = React.useCallback(async () => {
    setLoading(true);
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
              instanceId?: string;
              cpu?: number;
              ramMb?: number;
              storageGb?: number;
              createdAt?: string;
            }) => ({
              name: instance.name,
              instanceId: instance.instanceId,
              status: statusFromState(instance.state ?? "Unknown"),
              flavor: instance.cpu || instance.ramMb ? `${instance.cpu ?? 1}c-${Math.round((instance.ramMb ?? 2048) / 1024)}G` : instance.memoryUsage ? `2c-${instance.memoryUsage}` : "m1.medium",
              privateIp: instance.ipv4?.[0] ?? "-",
              az: data.source === "local" ? "local" : "multipass",
              network: data.source === "local" ? "local-net" : "multipass-nat",
              image: instance.release ?? instance.imageHash ?? "ubuntu-24.04-server",
              created: instance.createdAt ? new Date(instance.createdAt).toLocaleString() : "Just now",
              cpu: instance.cpu,
              ramMb: instance.ramMb,
              storageGb: instance.storageGb
            }))
          : [];

        setInstances(rows);
      } finally {
        setLoading(false);
      }
  }, []);

  React.useEffect(() => {
    void loadInstances();
  }, [loadInstances]);

  async function runInstanceAction(name: string, action: "start" | "stop" | "restart") {
    setActionPending(`${name}:${action}`);

    try {
      const response = await fetch(`/api/instances/${encodeURIComponent(name)}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        await loadInstances();
      }
    } finally {
      setActionPending(null);
    }
  }

  async function terminateInstance(name: string) {
    if (!window.confirm(`Terminate ${name}?`)) {
      return;
    }

    setActionPending(`${name}:terminate`);

    try {
      const response = await fetch(`/api/instances/${encodeURIComponent(name)}`, {
        method: "DELETE"
      });

      if (response.ok) {
        await loadInstances();
      }
    } finally {
      setActionPending(null);
    }
  }

  function selectOptions(key: keyof InstanceRow) {
    return Array.from(new Set(instances.map((instance) => instance[key]).filter(Boolean))).sort();
  }

  function updateFilter(key: keyof typeof filters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function sortBy(key: string) {
    if (!["name", "status", "image", "flavor", "az", "created"].includes(key)) {
      return;
    }

    setSort((current) => ({
      key: key as keyof InstanceRow,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc"
    }));
  }

  const filteredInstances = React.useMemo(() => {
    const query = search.trim().toLowerCase();

    return instances
      .filter((instance) => {
        const searchable = [
          instance.name,
          instance.status,
          instance.image,
          instance.flavor,
          instance.privateIp,
          instance.az,
          instance.network
        ].join(" ").toLowerCase();

        return !query || searchable.includes(query);
      })
      .filter((instance) => !filters.status || instance.status === filters.status)
      .filter((instance) => !filters.image || instance.image === filters.image)
      .filter((instance) => !filters.flavor || instance.flavor === filters.flavor)
      .filter((instance) => !filters.az || instance.az === filters.az)
      .filter((instance) => !filters.network || instance.network === filters.network)
      .sort((left, right) => {
        const leftValue = String(left[sort.key] ?? "");
        const rightValue = String(right[sort.key] ?? "");
        const compared = leftValue.localeCompare(rightValue, undefined, { numeric: true, sensitivity: "base" });
        return sort.direction === "asc" ? compared : -compared;
      });
  }, [filters, instances, search, sort]);

  const hasActiveFilters = Boolean(search || filters.status || filters.image || filters.flavor || filters.az || filters.network);

  const rows = filteredInstances.map((instance) => [
    <input key={`${instance.name}-select`} type="checkbox" className="h-4 w-4 rounded border" aria-label={`Select ${instance.name}`} />,
    <Link key={`${instance.name}-name`} href={`/instances/${encodeURIComponent(instance.name)}`} className="font-medium text-primary hover:underline">
      {instance.name}
    </Link>,
    <StatusBadge key={`${instance.name}-status`} status={instance.status} />,
    instance.status === "ACTIVE" ? "Running" : instance.status === "SHUTOFF" ? "Stopped" : "Pending",
    instance.image ?? "ubuntu-24.04-server",
    instance.flavor,
    <span key={`${instance.name}-private`} className="font-mono text-xs text-muted-foreground">{instance.privateIp}</span>,
    instance.privateIp === "-" ? "-" : instance.privateIp,
    instance.az,
    instance.created ?? "2026-07-12",
    <div key={`${instance.name}-actions`} className="flex flex-wrap gap-2">
      <Button size="sm" variant="secondary" disabled={Boolean(actionPending)} onClick={() => void runInstanceAction(instance.name, "start")}>
        <Play />
        Start
      </Button>
      <Button size="sm" variant="secondary" disabled={Boolean(actionPending)} onClick={() => void runInstanceAction(instance.name, "stop")}>
        <Power />
        Stop
      </Button>
      <Button size="sm" variant="secondary" disabled={Boolean(actionPending)} onClick={() => void runInstanceAction(instance.name, "restart")}>
        <RotateCw />
        Restart
      </Button>
      <Button
        disabled={Boolean(actionPending)}
        variant="destructive"
        size="sm"
        onClick={() => void terminateInstance(instance.name)}
      >
        <Trash2 />
        {actionPending === `${instance.name}:terminate` ? "Terminating" : "Terminate"}
      </Button>
    </div>
  ]);

  return (
    <div className="space-y-4">
      <FilterBar
        left={
          <>
            <div className="flex h-[42px] min-w-72 items-center gap-2 rounded-md border bg-background px-3 text-sm text-muted-foreground">
              <Search className="h-4 w-4" />
              <input
                className="h-full w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
                placeholder="Search instances"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <select className="h-[42px] rounded-md border bg-background px-3 text-sm" value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
              <option value="">Status</option>
              {selectOptions("status").map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
            <select className="h-[42px] rounded-md border bg-background px-3 text-sm" value={filters.image} onChange={(event) => updateFilter("image", event.target.value)}>
              <option value="">Image</option>
              {selectOptions("image").map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
            <select className="h-[42px] rounded-md border bg-background px-3 text-sm" value={filters.flavor} onChange={(event) => updateFilter("flavor", event.target.value)}>
              <option value="">Flavor</option>
              {selectOptions("flavor").map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
            <select className="h-[42px] rounded-md border bg-background px-3 text-sm" value={filters.az} onChange={(event) => updateFilter("az", event.target.value)}>
              <option value="">Availability Zone</option>
              {selectOptions("az").map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
            <select className="h-[42px] rounded-md border bg-background px-3 text-sm" value={filters.network} onChange={(event) => updateFilter("network", event.target.value)}>
              <option value="">Network</option>
              {selectOptions("network").map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
            {hasActiveFilters ? (
              <Button variant="ghost" onClick={() => {
                setSearch("");
                setFilters({ status: "", image: "", flavor: "", az: "", network: "" });
              }}>
                Clear
              </Button>
            ) : null}
          </>
        }
        right={
          <>
            <Button variant="secondary" disabled={loading} onClick={() => void loadInstances()}>
              <RefreshCw />
              Refresh
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
        sortKey={sort.key}
        sortDirection={sort.direction}
        onSort={sortBy}
        emptyTitle="No instances loaded"
        emptyDescription={hasActiveFilters ? "No instances match the selected filters." : "Launch an instance to show it here."}
      />
    </div>
  );
}

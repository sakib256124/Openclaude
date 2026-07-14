"use client";

import * as React from "react";
import { Download, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type ActivityLogRow = {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  resourceName: string | null;
  service: string | null;
  status: "INFO" | "SUCCESS" | "FAILURE";
  safeMessage: string;
  requestId: string | null;
  createdAt: string | Date;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
};

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function ActivityLogView({ initialLogs }: { initialLogs: ActivityLogRow[] }) {
  const [logs, setLogs] = React.useState(initialLogs);
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("ALL");
  const [service, setService] = React.useState("ALL");

  const filteredLogs = logs.filter((log) => {
    const haystack = `${log.action} ${log.resourceType} ${log.resourceName ?? ""} ${log.safeMessage} ${log.user.email}`.toLowerCase();
    const matchesQuery = haystack.includes(query.toLowerCase());
    const matchesStatus = status === "ALL" || log.status === status;
    const matchesService = service === "ALL" || log.service === service;

    return matchesQuery && matchesStatus && matchesService;
  });

  async function refresh() {
    const response = await fetch("/api/activity-logs?pageSize=100");
    const payload = (await response.json()) as { logs: ActivityLogRow[] };
    setLogs(payload.logs);
  }

  function exportCsv() {
    const header = ["createdAt", "user", "action", "service", "resourceType", "resourceName", "status", "safeMessage"];
    const rows = filteredLogs.map((log) =>
      [
        new Date(log.createdAt).toISOString(),
        log.user.email,
        log.action,
        log.service ?? "",
        log.resourceType,
        log.resourceName ?? "",
        log.status,
        log.safeMessage
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(",")
    );
    const blob = new Blob([[header.join(","), ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "opencloud-activity-logs.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none ring-primary focus:ring-2"
            placeholder="Search logs"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-md border bg-background px-3 text-sm outline-none ring-primary focus:ring-2"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="ALL">All results</option>
          <option value="INFO">Info</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILURE">Failure</option>
        </select>
        <select
          className="h-10 rounded-md border bg-background px-3 text-sm outline-none ring-primary focus:ring-2"
          value={service}
          onChange={(event) => setService(event.target.value)}
        >
          <option value="ALL">All services</option>
          <option value="auth">Auth</option>
          <option value="multipass">Multipass</option>
          <option value="network">Network</option>
          <option value="storage">Storage</option>
          <option value="image">Image</option>
        </select>
        <Button variant="secondary" onClick={refresh}>
          Refresh
        </Button>
        <Button variant="secondary" onClick={exportCsv}>
          <Download />
          CSV
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="hidden grid-cols-[170px_1fr_120px_150px_110px_1.4fr] border-b px-4 py-3 text-xs font-semibold uppercase text-muted-foreground xl:grid">
          <div>Time</div>
          <div>User / Action</div>
          <div>Service</div>
          <div>Resource</div>
          <div>Result</div>
          <div>Message</div>
        </div>
        {filteredLogs.map((log) => (
          <div key={log.id} className="grid gap-3 border-b px-4 py-4 last:border-b-0 xl:grid-cols-[170px_1fr_120px_150px_110px_1.4fr] xl:items-center">
            <div className="text-sm text-muted-foreground">{formatDate(log.createdAt)}</div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{log.action}</div>
              <div className="truncate text-xs text-muted-foreground">{log.user.name ?? log.user.email}</div>
            </div>
            <div className="text-sm text-muted-foreground">{log.service ?? "application"}</div>
            <div className="min-w-0 text-sm">
              <div>{log.resourceType}</div>
              <div className="truncate text-xs text-muted-foreground">{log.resourceName ?? log.resourceId ?? ""}</div>
            </div>
            <Badge className={log.status === "FAILURE" ? "border-destructive/40 text-destructive" : "border-primary/40 text-primary"}>
              {log.status}
            </Badge>
            <div className="text-sm text-muted-foreground">{log.safeMessage}</div>
          </div>
        ))}
        {filteredLogs.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">No activity logs match the current filters.</div>
        ) : null}
      </div>
    </div>
  );
}

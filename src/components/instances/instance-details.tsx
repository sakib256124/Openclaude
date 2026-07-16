"use client";

import * as React from "react";
import { InstanceActions } from "@/components/instances/instance-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { QuotaProgress } from "@/components/ui/quota-progress";
import { StatusBadge } from "@/components/ui/status-badge";

type Instance = {
  name: string;
  state?: string;
  ipv4?: string[];
  release?: string;
  imageHash?: string;
  load?: string[];
  diskUsage?: string;
  memoryUsage?: string;
  mountCount?: number;
  cpu?: number;
  ramMb?: number;
  storageGb?: number;
  privateIp?: string | null;
  publicIp?: string | null;
  availabilityZone?: string;
  ownerEmail?: string | null;
  ownerName?: string | null;
  network?: { networkId: string; name: string; cidr: string } | null;
  securityGroup?: { groupId: string; name: string } | null;
  image?: { imageId: string; name: string; slug: string } | null;
  launchedAt?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
};

function statusFromState(state?: string) {
  if (state === "Running") {
    return "ACTIVE";
  }

  if (state === "Stopped") {
    return "SHUTOFF";
  }

  if (state === "Starting") {
    return "BUILD";
  }

  return state?.toUpperCase() ?? "UNKNOWN";
}

export function InstanceDetails({ instanceId }: { instanceId: string }) {
  const [instance, setInstance] = React.useState<Instance | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/instances/${encodeURIComponent(instanceId)}`, { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(payload.error?.message ?? "Unable to load instance.");
        setInstance(null);
        return;
      }

      setInstance(payload.instance ?? null);
    } catch {
      setError("Unable to load instance.");
      setInstance(null);
    } finally {
      setLoading(false);
    }
  }, [instanceId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const cpuPercent = instance?.state === "Running" ? Math.min(95, (instance.load?.length ?? 1) * 12) : 0;
  const ramPercent = instance?.state === "Running" ? 48 : 0;
  const diskPercent = instance?.diskUsage ? 44 : 0;
  const ip = instance?.privateIp ?? instance?.ipv4?.[0] ?? "-";
  const multipassShellCommand = `multipass shell ${instance?.name ?? instanceId}`;
  const sshCommand = ip === "-" ? "Waiting for instance IP address" : `ssh ubuntu@${ip}`;

  return (
    <section className="space-y-4">
      <InstanceActions instanceId={instance?.name ?? instanceId} onChanged={load} />
      {error ? (
        <Card>
          <CardContent className="flex min-h-24 items-center justify-between gap-3 text-sm text-destructive">
            {error}
            <button className="text-primary" type="button" onClick={() => void load()}>Retry</button>
          </CardContent>
        </Card>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading instance details...</div>
          ) : (
            <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="text-muted-foreground">Instance</dt>
                <dd className="mt-1 font-mono">{instance?.name ?? instanceId}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd className="mt-1">
                  <StatusBadge status={statusFromState(instance?.state)} />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Operating system</dt>
                <dd className="mt-1">{instance?.release ?? instance?.imageHash ?? "Ubuntu"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Resources</dt>
                <dd className="mt-1">{instance?.cpu ?? 1} vCPU / {instance?.ramMb ? `${Math.round(instance.ramMb / 1024)} GB` : "2 GB"} RAM / {instance?.storageGb ?? 10} GB</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Private IP</dt>
                <dd className="mt-1 font-mono">{ip}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Availability zone</dt>
                <dd className="mt-1">{instance?.availabilityZone ?? "local"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Owner</dt>
                <dd className="mt-1">{instance?.ownerName ?? instance?.ownerEmail ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Created</dt>
                <dd className="mt-1">{instance?.createdAt ? new Date(instance.createdAt).toLocaleString() : "-"}</dd>
              </div>
            </dl>
          )}
        </CardContent>
      </Card>
      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Networking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Private address</span><span className="font-mono text-xs">{ip}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Public address</span><span className="font-mono text-xs">{instance?.publicIp ?? "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Network</span><span>{instance?.network?.name ?? "multipass-nat"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Security group</span><span>{instance?.securityGroup?.name ?? "-"}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Storage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Root disk</span><span>{instance?.storageGb ?? 10} GB</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Disk usage</span><span>{instance?.diskUsage ?? "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Mounts</span><span>{instance?.mountCount ?? 0}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monitoring</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <QuotaProgress label="CPU" used={cpuPercent} limit={100} />
            <QuotaProgress label="RAM" used={ramPercent} limit={100} />
            <QuotaProgress label="Disk" used={diskPercent} limit={100} />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Access</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          <div className="rounded-md border bg-background p-3">
            <div className="text-xs text-muted-foreground">Multipass shell</div>
            <div className="mt-2 break-all font-mono text-xs">{multipassShellCommand}</div>
            <div className="mt-2">
              <CopyButton value={multipassShellCommand} label="Copy" />
            </div>
          </div>
          <div className="rounded-md border bg-background p-3">
            <div className="text-xs text-muted-foreground">SSH command</div>
            <div className="mt-2 break-all font-mono text-xs">{sshCommand}</div>
            <div className="mt-2">
              <CopyButton value={sshCommand} label="Copy" />
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

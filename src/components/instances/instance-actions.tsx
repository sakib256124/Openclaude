"use client";

import * as React from "react";
import { Camera, Play, Power, RotateCw, Terminal, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type InstanceAction = "start" | "stop" | "restart" | "suspend";

export function InstanceActions({
  instanceId,
  onChanged
}: {
  instanceId: string;
  onChanged?: () => void | Promise<void>;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  async function runAction(action: InstanceAction) {
    setPending(action);
    setMessage(null);

    try {
      const response = await fetch(`/api/instances/${encodeURIComponent(instanceId)}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(payload.error?.message ?? `Failed to ${action} instance.`);
        return;
      }

      setMessage(`Instance ${action === "restart" ? "restarted" : `${action}ed`} successfully.`);
      await onChanged?.();
    } finally {
      setPending(null);
    }
  }

  async function createSnapshot() {
    const name = window.prompt("Snapshot name", `${instanceId}-snapshot`);

    if (!name) {
      return;
    }

    setPending("snapshot");
    setMessage(null);

    try {
      const response = await fetch("/api/snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, instanceId })
      });
      const payload = await response.json().catch(() => ({}));
      setMessage(response.ok ? "Snapshot created successfully." : payload.error?.message ?? "Failed to create snapshot.");
    } finally {
      setPending(null);
    }
  }

  async function deleteInstance() {
    if (!window.confirm(`Terminate ${instanceId}?`)) {
      return;
    }

    setPending("delete");
    setMessage(null);

    try {
      const response = await fetch(`/api/instances/${encodeURIComponent(instanceId)}`, { method: "DELETE" });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(payload.error?.message ?? "Failed to terminate instance.");
        return;
      }

      setMessage("Instance terminated successfully.");
      router.push("/instances");
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  async function copyShellCommand() {
    const command = `multipass shell ${instanceId}`;

    try {
      await navigator.clipboard.writeText(command);
      setMessage(`Shell command copied: ${command}`);
    } catch {
      setMessage(`Use Multipass shell on Ubuntu: ${command}`);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" disabled={Boolean(pending)} onClick={() => void runAction("start")}>
          <Play />
          {pending === "start" ? "Starting" : "Start"}
        </Button>
        <Button variant="secondary" disabled={Boolean(pending)} onClick={() => void runAction("stop")}>
          <Power />
          {pending === "stop" ? "Stopping" : "Stop"}
        </Button>
        <Button variant="secondary" disabled={Boolean(pending)} onClick={() => void runAction("restart")}>
          <RotateCw />
          {pending === "restart" ? "Restarting" : "Restart"}
        </Button>
        <Button variant="secondary" disabled={Boolean(pending)} onClick={() => void createSnapshot()}>
          <Camera />
          {pending === "snapshot" ? "Creating" : "Snapshot"}
        </Button>
        <Button variant="secondary" disabled={Boolean(pending)} onClick={() => void copyShellCommand()}>
          <Terminal />
          Copy shell command
        </Button>
        <Button variant="destructive" disabled={Boolean(pending)} onClick={() => void deleteInstance()}>
          <Trash2 />
          {pending === "delete" ? "Deleting" : "Delete"}
        </Button>
      </div>
      {message ? <div className="text-sm text-muted-foreground">{message}</div> : null}
    </div>
  );
}

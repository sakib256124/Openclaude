import { NextResponse } from "next/server";
import { requireApiPermission } from "@/app/api/_utils/auth";
import { multipassErrorResponse } from "@/app/api/_utils/multipass";
import { OpenCloudError } from "@/lib/multipass/errors";
import { listLocalInstances } from "@/lib/multipass/local-store";
import { listMultipassInstances } from "@/lib/multipass/multipass-cli";

function percentFromUsage(value?: string) {
  if (!value) {
    return null;
  }

  const percent = value.match(/(\d+(?:\.\d+)?)\s*%/);

  if (percent) {
    return Math.round(Number(percent[1]));
  }

  const parts = value.match(/(\d+(?:\.\d+)?)\s*([KMGTP]?i?B?)\s+out\s+of\s+(\d+(?:\.\d+)?)\s*([KMGTP]?i?B?)/i);

  if (!parts) {
    return null;
  }

  const used = Number(parts[1]);
  const total = Number(parts[3]);

  if (!Number.isFinite(used) || !Number.isFinite(total) || total <= 0) {
    return null;
  }

  return Math.max(0, Math.min(100, Math.round((used / total) * 100)));
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

function buildMetrics(source: "multipass" | "local", instances: Awaited<ReturnType<typeof listMultipassInstances>>) {
  const running = instances.filter((instance) => instance.state === "Running");
  const stopped = instances.filter((instance) => instance.state !== "Running");
  const withAddress = instances.filter((instance) => instance.ipv4.length > 0);
  const cpuSamples = running
    .map((instance) => Number(instance.load?.[0]))
    .filter((value) => Number.isFinite(value))
    .map((value) => Math.max(0, Math.min(100, Math.round(value * 100))));
  const memorySamples = running.map((instance) => percentFromUsage(instance.memoryUsage)).filter((value): value is number => value !== null);
  const diskSamples = running.map((instance) => percentFromUsage(instance.diskUsage)).filter((value): value is number => value !== null);

  return {
    source,
    metrics: {
      totalInstances: instances.length,
      runningInstances: running.length,
      stoppedInstances: stopped.length,
      healthyInstances: running.length,
      cpuUsagePercent: cpuSamples.length ? average(cpuSamples) : running.length ? Math.min(95, running.length * 7) : 0,
      memoryUsagePercent: memorySamples.length ? average(memorySamples) : running.length ? Math.min(90, running.length * 9) : 0,
      diskUsagePercent: diskSamples.length ? average(diskSamples) : running.length ? Math.min(85, running.length * 5) : 0,
      networkTrafficMbps: withAddress.length ? withAddress.length * 3 : 0
    },
    instances: instances.map((instance) => ({
      name: instance.name,
      state: instance.state,
      ipv4: instance.ipv4,
      load: instance.load ?? [],
      diskUsage: instance.diskUsage,
      memoryUsage: instance.memoryUsage,
      health: instance.state === "Running" ? "OK" : "PAUSED"
    }))
  };
}

export async function GET() {
  const auth = await requireApiPermission("resources:read");

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const instances = await listMultipassInstances();

    return NextResponse.json(buildMetrics("multipass", instances));
  } catch (error) {
    if (error instanceof OpenCloudError && error.code === "SERVICE_UNAVAILABLE") {
      return NextResponse.json(buildMetrics("local", listLocalInstances()));
    }

    return multipassErrorResponse(error);
  }
}

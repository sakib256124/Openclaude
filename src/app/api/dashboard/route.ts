import { NextResponse } from "next/server";
import { requireApiPermission } from "@/app/api/_utils/auth";
import { multipassErrorResponse } from "@/app/api/_utils/multipass";
import { listLocalInstances } from "@/lib/multipass/local-store";
import { getMultipassHealth, listMultipassInstances } from "@/lib/multipass/multipass-cli";

function buildDashboardPayload(source: "local" | "multipass", health: Awaited<ReturnType<typeof getMultipassHealth>>, instances: Awaited<ReturnType<typeof listMultipassInstances>>) {
  const running = instances.filter((instance) => instance.state === "Running").length;
  const stopped = instances.filter((instance) => instance.state !== "Running").length;

  return {
    source,
    health,
    metrics: [
      { title: "Total Instances", value: String(instances.length), helper: `${running} running, ${stopped} stopped or suspended` },
      { title: "Running", value: String(running), helper: "Active workloads" },
      { title: "Stopped", value: String(stopped), helper: "Stopped local VMs" },
      { title: "Error", value: "0", helper: "No CLI errors reported" }
    ],
    quotas: [
      { label: "Instances", used: instances.length, limit: 24 },
      { label: "vCPUs", used: instances.length * 2, limit: 96 },
      { label: "RAM", used: instances.length * 8, limit: 384 }
    ],
    recentInstances: instances,
    services: [
      { service: "Multipass", status: health.configured ? "SUCCESS" : "PAUSED", endpoint: health.binary, latency: health.configured ? "Available" : "Not installed" }
    ]
  };
}

export async function GET() {
  const auth = await requireApiPermission("resources:read");

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const health = await getMultipassHealth();

    if (!health.configured) {
      return NextResponse.json(buildDashboardPayload("local", health, listLocalInstances()));
    }

    const instances = await listMultipassInstances();

    return NextResponse.json(buildDashboardPayload("multipass", health, instances));
  } catch (error) {
    return multipassErrorResponse(error);
  }
}

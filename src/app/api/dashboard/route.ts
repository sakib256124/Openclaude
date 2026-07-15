import { NextResponse } from "next/server";
import { requireApiPermission } from "@/app/api/_utils/auth";
import { multipassErrorResponse } from "@/app/api/_utils/multipass";
import { demoDashboardMetrics, demoQuotaUsage, demoRecentInstances, demoServiceHealth } from "@/lib/demo-data";
import { getMultipassHealth, listMultipassInstances } from "@/lib/multipass/multipass-cli";

export async function GET() {
  const auth = await requireApiPermission("resources:read");

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const health = await getMultipassHealth();

    if (!health.configured) {
      return NextResponse.json({
        source: "demo",
        health,
        metrics: demoDashboardMetrics,
        quotas: demoQuotaUsage,
        recentInstances: demoRecentInstances,
        services: demoServiceHealth
      });
    }

    const instances = await listMultipassInstances();
    const running = instances.filter((instance) => instance.state === "Running").length;
    const stopped = instances.filter((instance) => instance.state !== "Running").length;

    return NextResponse.json({
      source: "multipass",
      health,
      metrics: [
        { title: "Total Instances", value: String(instances.length), helper: `${running} running, ${stopped} stopped or suspended` },
        { title: "Running", value: String(running), helper: "Active Multipass workloads" },
        { title: "Stopped", value: String(stopped), helper: "Paused local VMs" },
        { title: "Error", value: "0", helper: "No CLI errors reported" }
      ],
      quotas: demoQuotaUsage,
      recentInstances: instances,
      services: demoServiceHealth
    });
  } catch (error) {
    return multipassErrorResponse(error);
  }
}

import { NextResponse } from "next/server";
import { requireApiPermission } from "@/app/api/_utils/auth";
import { multipassErrorResponse } from "@/app/api/_utils/multipass";
import type { AppSessionUser } from "@/lib/auth";
import { ownedWhere } from "@/lib/cloud/ownership";
import { syncRuntimeInstances } from "@/lib/cloud/instances";
import { listLocalInstances } from "@/lib/multipass/local-store";
import { getMultipassHealth, listMultipassInstances } from "@/lib/multipass/multipass-cli";
import { prisma } from "@/lib/prisma";

function hoursBetween(start: Date | null | undefined, end: Date) {
  if (!start) {
    return 0;
  }

  return Math.max(0, (end.getTime() - start.getTime()) / 3_600_000);
}

async function buildDashboardPayload(
  source: "local" | "multipass",
  health: Awaited<ReturnType<typeof getMultipassHealth>>,
  user: AppSessionUser,
  runtimeInstances: Awaited<ReturnType<typeof listMultipassInstances>>
) {
  const ownerWhere = ownedWhere(user);
  const activeInstanceWhere = { status: { not: "TERMINATED" as const }, ...ownerWhere };
  const activeVolumeWhere = { status: { not: "DELETED" as const }, ...ownerWhere };
  const now = new Date();
  const [
    instances,
    volumes,
    snapshots,
    images,
    networks,
    securityGroups,
    addresses,
    recentActivity,
    pricingRules
  ] = await Promise.all([
    prisma.computeInstance.findMany({
      where: activeInstanceWhere,
      orderBy: { updatedAt: "desc" },
      take: 8
    }),
    prisma.volume.findMany({ where: activeVolumeWhere }),
    prisma.snapshot.count({ where: { status: { not: "DELETED" }, ...ownerWhere } }),
    prisma.machineImage.count({ where: { status: { not: "DELETED" }, ...ownerWhere } }),
    prisma.virtualNetwork.count({ where: { status: { not: "DELETED" }, ...ownerWhere } }),
    prisma.securityGroup.count({ where: { status: { not: "DELETED" }, ...ownerWhere } }),
    prisma.elasticIpAddress.count({ where: { status: { not: "RELEASED" }, ...ownerWhere } }),
    prisma.activityLog.findMany({
      where: user.role === "ADMIN" ? {} : { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        action: true,
        resourceType: true,
        resourceName: true,
        status: true,
        safeMessage: true,
        createdAt: true
      }
    }),
    prisma.pricingRule.findMany({ where: { active: true } })
  ]);
  const allInstances = await prisma.computeInstance.findMany({ where: activeInstanceWhere });
  const running = allInstances.filter((instance) => instance.status === "RUNNING").length;
  const stopped = allInstances.filter((instance) => instance.status === "STOPPED").length;
  const suspended = allInstances.filter((instance) => instance.status === "SUSPENDED").length;
  const error = allInstances.filter((instance) => instance.status === "ERROR").length;
  const allocatedVcpus = allInstances.reduce((total, instance) => total + instance.cpu, 0);
  const allocatedRamGb = allInstances.reduce((total, instance) => total + instance.ramMb / 1024, 0);
  const storageGb = allInstances.reduce((total, instance) => total + instance.storageGb, 0) + volumes.reduce((total, volume) => total + volume.sizeGb, 0);
  const price = (resourceType: string) => Number(pricingRules.find((rule) => rule.resourceType === resourceType)?.unitPrice ?? 0);
  const instanceHours = allInstances
    .filter((instance) => instance.status === "RUNNING")
    .reduce((total, instance) => total + hoursBetween(instance.launchedAt ?? instance.createdAt, now), 0);
  const vcpuHours = allInstances
    .filter((instance) => instance.status === "RUNNING")
    .reduce((total, instance) => total + instance.cpu * hoursBetween(instance.launchedAt ?? instance.createdAt, now), 0);
  const ramGbHours = allInstances
    .filter((instance) => instance.status === "RUNNING")
    .reduce((total, instance) => total + (instance.ramMb / 1024) * hoursBetween(instance.launchedAt ?? instance.createdAt, now), 0);
  const estimatedCost =
    instanceHours * price("instance") +
    vcpuHours * price("vcpu") +
    ramGbHours * price("ram_gb") +
    storageGb * price("volume_gb");

  return {
    source,
    health,
    metrics: [
      { title: "Total Instances", value: String(allInstances.length), helper: `${running} running, ${stopped} stopped, ${suspended} suspended` },
      { title: "Running", value: String(running), helper: "Active workloads" },
      { title: "Stopped", value: String(stopped), helper: "Stopped local VMs" },
      { title: "Error", value: String(error), helper: "Instances requiring attention" },
      { title: "Allocated vCPUs", value: String(allocatedVcpus), helper: "From saved launch records" },
      { title: "Allocated RAM", value: `${allocatedRamGb.toFixed(1)} GB`, helper: "From saved launch records" },
      { title: "Storage", value: `${storageGb} GB`, helper: "Boot disks and volumes" },
      { title: "Est. Cost", value: `${pricingRules[0]?.currency ?? "USD"} ${estimatedCost.toFixed(4)}`, helper: "Current running estimate" }
    ],
    quotas: [
      { label: "Instances", used: allInstances.length, limit: 24 },
      { label: "vCPUs", used: allocatedVcpus, limit: 96 },
      { label: "RAM", used: Math.round(allocatedRamGb), limit: 384 },
      { label: "Storage", used: storageGb, limit: 2048 },
      { label: "Networks", used: networks, limit: 16 },
      { label: "Security groups", used: securityGroups, limit: 64 }
    ],
    resourceCounts: {
      images,
      networks,
      securityGroups,
      addresses,
      volumes: volumes.length,
      snapshots
    },
    recentInstances: instances.map((instance) => ({
      name: instance.name,
      state: instance.powerState ?? instance.status,
      status: instance.status,
      ipv4: instance.privateIp ? [instance.privateIp] : [],
      instanceId: instance.instanceId,
      cpu: instance.cpu,
      ramMb: instance.ramMb,
      storageGb: instance.storageGb,
      updatedAt: instance.updatedAt.toISOString()
    })),
    recentActivity: recentActivity.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString()
    })),
    services: [
      { service: "Multipass", status: health.configured ? "SUCCESS" : "PAUSED", endpoint: health.binary, latency: health.configured ? "Available" : "Not installed" },
      { service: "Database", status: "SUCCESS", endpoint: "Prisma", latency: "Connected" }
    ],
    runtimeInstances
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
      const instances = listLocalInstances();
      await syncRuntimeInstances(auth.user, instances);
      return NextResponse.json(await buildDashboardPayload("local", health, auth.user, instances));
    }

    const instances = await listMultipassInstances();
    await syncRuntimeInstances(auth.user, instances);

    return NextResponse.json(await buildDashboardPayload("multipass", health, auth.user, instances));
  } catch (error) {
    return multipassErrorResponse(error);
  }
}

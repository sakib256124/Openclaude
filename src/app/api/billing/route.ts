import { NextResponse } from "next/server";
import { requireApiPermission } from "@/app/api/_utils/auth";
import { ownedWhere } from "@/lib/cloud/ownership";
import { prisma } from "@/lib/prisma";

function hoursBetween(start: Date | null, end: Date) {
  if (!start) {
    return 0;
  }

  return Math.max(0, (end.getTime() - start.getTime()) / 3_600_000);
}

export async function GET() {
  const auth = await requireApiPermission("resources:read");

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const now = new Date();
    const [instances, volumes, pricingRules] = await Promise.all([
      prisma.computeInstance.findMany({
        where: {
          status: { not: "TERMINATED" },
          ...ownedWhere(auth.user)
        }
      }),
      prisma.volume.findMany({
        where: {
          status: { not: "DELETED" },
          ...ownedWhere(auth.user)
        }
      }),
      prisma.pricingRule.findMany({ where: { active: true } })
    ]);
    const price = (resourceType: string) =>
      Number(pricingRules.find((rule) => rule.resourceType === resourceType)?.unitPrice ?? 0);
    const runningInstances = instances.filter((instance) => instance.status === "RUNNING");
    const instanceHours = runningInstances.reduce((total, instance) => total + hoursBetween(instance.launchedAt ?? instance.createdAt, now), 0);
    const vcpuHours = runningInstances.reduce((total, instance) => total + instance.cpu * hoursBetween(instance.launchedAt ?? instance.createdAt, now), 0);
    const ramGbHours = runningInstances.reduce((total, instance) => total + (instance.ramMb / 1024) * hoursBetween(instance.launchedAt ?? instance.createdAt, now), 0);
    const storageGbMonth = volumes.reduce((total, volume) => total + volume.sizeGb, 0) + instances.reduce((total, instance) => total + instance.storageGb, 0);
    const rows = [
      {
        service: "Instance runtime",
        usage: `${instanceHours.toFixed(2)} instance hours`,
        estimatedCost: instanceHours * price("instance"),
        note: `${runningInstances.length} running instances`
      },
      {
        service: "vCPU",
        usage: `${vcpuHours.toFixed(2)} vCPU hours`,
        estimatedCost: vcpuHours * price("vcpu"),
        note: "Calculated from running instances"
      },
      {
        service: "RAM",
        usage: `${ramGbHours.toFixed(2)} GB RAM hours`,
        estimatedCost: ramGbHours * price("ram_gb"),
        note: "Calculated from running instances"
      },
      {
        service: "Storage",
        usage: `${storageGbMonth} GB month estimate`,
        estimatedCost: storageGbMonth * price("volume_gb"),
        note: "Boot disks plus created volumes"
      }
    ];

    return NextResponse.json({
      currency: pricingRules[0]?.currency ?? "USD",
      total: rows.reduce((total, row) => total + row.estimatedCost, 0),
      rows
    });
  } catch {
    return NextResponse.json({ currency: "USD", total: 0, rows: [] });
  }
}

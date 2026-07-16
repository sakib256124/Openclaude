import { NextResponse } from "next/server";
import type { AppSessionUser } from "@/lib/auth";
import { ownedWhere } from "@/lib/cloud/ownership";
import { prisma } from "@/lib/prisma";
import { requireApiPermission } from "@/app/api/_utils/auth";

type SearchResult = {
  id: string;
  label: string;
  subtitle: string;
  resourceType: string;
  status?: string | null;
  href: string;
};

function contains(value: string) {
  return { contains: value, mode: "insensitive" as const };
}

function scopedWhere(user: AppSessionUser, searchWhere: object) {
  const ownerWhere = ownedWhere(user);

  if (Object.keys(ownerWhere).length === 0) {
    return searchWhere;
  }

  return { AND: [ownerWhere, searchWhere] };
}

function textSearch(fields: string[], query: string) {
  return {
    OR: fields.map((field) => ({ [field]: contains(query) }))
  };
}

function resultLimit(url: URL) {
  return Math.min(Math.max(Number(url.searchParams.get("limit") ?? "24"), 8), 50);
}

export async function GET(request: Request) {
  const auth = await requireApiPermission("resources:read");

  if (!auth.ok) {
    return auth.response;
  }

  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() ?? "";
  const limit = resultLimit(url);
  const take = Math.max(3, Math.ceil(limit / 8));

  if (query.length < 2) {
    return NextResponse.json({ query, results: [] });
  }

  try {
    const [instances, images, keyPairs, networks, securityGroups, addresses, volumes, snapshots] =
      await prisma.$transaction([
        prisma.computeInstance.findMany({
          where: scopedWhere(auth.user, textSearch(["instanceId", "name", "multipassName", "privateIp", "publicIp", "imageRef"], query)),
          orderBy: { updatedAt: "desc" },
          take
        }),
        prisma.machineImage.findMany({
          where: scopedWhere(auth.user, textSearch(["imageId", "name", "slug", "operatingSystem", "version", "description"], query)),
          orderBy: { updatedAt: "desc" },
          take
        }),
        prisma.keyPair.findMany({
          where: scopedWhere(auth.user, textSearch(["keyPairId", "name", "fingerprint", "type"], query)),
          orderBy: { updatedAt: "desc" },
          take
        }),
        prisma.virtualNetwork.findMany({
          where: scopedWhere(auth.user, textSearch(["networkId", "name", "cidr", "description"], query)),
          orderBy: { updatedAt: "desc" },
          take
        }),
        prisma.securityGroup.findMany({
          where: scopedWhere(auth.user, textSearch(["groupId", "name", "description"], query)),
          orderBy: { updatedAt: "desc" },
          take
        }),
        prisma.elasticIpAddress.findMany({
          where: scopedWhere(auth.user, textSearch(["allocationId", "publicIp"], query)),
          orderBy: { updatedAt: "desc" },
          take
        }),
        prisma.volume.findMany({
          where: scopedWhere(auth.user, textSearch(["volumeId", "name", "availabilityZone", "mountPath"], query)),
          orderBy: { updatedAt: "desc" },
          take
        }),
        prisma.snapshot.findMany({
          where: scopedWhere(auth.user, textSearch(["snapshotId", "name"], query)),
          orderBy: { updatedAt: "desc" },
          take
        })
      ]);

    const results: SearchResult[] = [
      ...instances.map((item) => ({
        id: item.instanceId,
        label: item.name,
        subtitle: [item.instanceId, item.privateIp, item.imageRef].filter(Boolean).join(" / "),
        resourceType: "Instance",
        status: item.status,
        href: `/instances/${encodeURIComponent(item.multipassName ?? item.name)}`
      })),
      ...images.map((item) => ({
        id: item.imageId,
        label: item.name,
        subtitle: [item.imageId, item.operatingSystem, item.version].filter(Boolean).join(" / "),
        resourceType: "Image",
        status: item.status,
        href: "/images"
      })),
      ...keyPairs.map((item) => ({
        id: item.keyPairId,
        label: item.name,
        subtitle: [item.keyPairId, item.type, item.fingerprint].filter(Boolean).join(" / "),
        resourceType: "Key pair",
        href: "/key-pairs"
      })),
      ...networks.map((item) => ({
        id: item.networkId,
        label: item.name,
        subtitle: [item.networkId, item.cidr].filter(Boolean).join(" / "),
        resourceType: "Network",
        status: item.status,
        href: `/networks/${encodeURIComponent(item.networkId)}`
      })),
      ...securityGroups.map((item) => ({
        id: item.groupId,
        label: item.name,
        subtitle: [item.groupId, item.description].filter(Boolean).join(" / "),
        resourceType: "Security group",
        status: item.status,
        href: `/security-groups/${encodeURIComponent(item.groupId)}`
      })),
      ...addresses.map((item) => ({
        id: item.allocationId,
        label: item.publicIp,
        subtitle: item.allocationId,
        resourceType: "Address",
        status: item.status,
        href: "/floating-ips"
      })),
      ...volumes.map((item) => ({
        id: item.volumeId,
        label: item.name,
        subtitle: `${item.volumeId} / ${item.sizeGb} GB / ${item.availabilityZone}`,
        resourceType: "Volume",
        status: item.status,
        href: `/volumes/${encodeURIComponent(item.volumeId)}`
      })),
      ...snapshots.map((item) => ({
        id: item.snapshotId,
        label: item.name,
        subtitle: `${item.snapshotId} / ${item.sizeGb} GB`,
        resourceType: "Snapshot",
        status: item.status,
        href: item.volumeId ? "/volume-snapshots" : "/snapshots"
      }))
    ].slice(0, limit);

    return NextResponse.json({ query, results });
  } catch {
    return NextResponse.json({ query, results: [] });
  }
}

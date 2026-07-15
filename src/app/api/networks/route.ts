import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiPermission } from "@/app/api/_utils/auth";
import { ownerFields, ownedWhere } from "@/lib/cloud/ownership";
import { createCloudResourceId } from "@/lib/cloud/resource-ids";
import { prisma } from "@/lib/prisma";

const createNetworkSchema = z.object({
  name: z.string().trim().min(1).max(120),
  cidr: z.string().trim().regex(/^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/),
  subnetName: z.string().trim().min(1).max(120).optional(),
  subnetCidr: z.string().trim().regex(/^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/).optional(),
  availabilityZone: z.string().trim().min(1).max(80).default("local"),
  description: z.string().trim().max(500).optional()
});

export async function GET() {
  const auth = await requireApiPermission("resources:read");

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const networks = await prisma.virtualNetwork.findMany({
      where: {
        status: { not: "DELETED" },
        ...ownedWhere(auth.user)
      },
      include: { subnets: true },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ networks });
  } catch {
    return NextResponse.json({
      networks: [
        {
          name: "multipass-nat",
          cidr: "managed-by-multipass",
          status: "AVAILABLE",
          description: "Default Multipass bridge/NAT network on the Ubuntu host."
        }
      ]
    });
  }
}

export async function POST(request: Request) {
  const auth = await requireApiPermission("resources:write");

  if (!auth.ok) {
    return auth.response;
  }

  const parsed = createNetworkSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_FAILED", message: "Network details are invalid.", fieldErrors: parsed.error.flatten().fieldErrors, requestId: null } },
      { status: 400 }
    );
  }

  try {
    const network = await prisma.virtualNetwork.create({
      data: {
        networkId: createCloudResourceId("network"),
        name: parsed.data.name,
        cidr: parsed.data.cidr,
        status: "AVAILABLE",
        description: parsed.data.description,
        ...ownerFields(auth.user),
        subnets: parsed.data.subnetCidr
          ? {
              create: {
                subnetId: createCloudResourceId("subnet"),
                name: parsed.data.subnetName ?? `${parsed.data.name}-subnet`,
                cidr: parsed.data.subnetCidr,
                availabilityZone: parsed.data.availabilityZone,
                status: "AVAILABLE"
              }
            }
          : undefined
      },
      include: { subnets: true }
    });

    return NextResponse.json({ network }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: { code: "DATABASE_UNAVAILABLE", message: "Network management needs PostgreSQL/Neon to be available.", requestId: null } },
      { status: 503 }
    );
  }
}

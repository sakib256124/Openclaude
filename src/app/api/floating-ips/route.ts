import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiPermission } from "@/app/api/_utils/auth";
import { ownerFields, ownedWhere } from "@/lib/cloud/ownership";
import { createCloudResourceId } from "@/lib/cloud/resource-ids";
import { prisma } from "@/lib/prisma";

const floatingIpSchema = z.object({
  publicIp: z.string().trim().ip().optional(),
  networkId: z.string().trim().min(1).optional()
});

function generatedLabAddress() {
  return `192.0.2.${Math.floor(Math.random() * 200) + 10}`;
}

export async function GET() {
  const auth = await requireApiPermission("resources:read");

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const floatingIps = await prisma.elasticIpAddress.findMany({
      where: {
        status: { not: "RELEASED" },
        ...ownedWhere(auth.user)
      },
      include: { instance: true, network: true },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ floatingIps });
  } catch {
    return NextResponse.json({ floatingIps: [] });
  }
}

export async function POST(request: Request) {
  const auth = await requireApiPermission("resources:write");

  if (!auth.ok) {
    return auth.response;
  }

  const parsed = floatingIpSchema.safeParse(await request.json().catch(() => ({})));

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_FAILED", message: "Floating IP request is invalid.", fieldErrors: parsed.error.flatten().fieldErrors, requestId: null } },
      { status: 400 }
    );
  }

  try {
    const network = parsed.data.networkId
      ? await prisma.virtualNetwork.findFirst({
          where: {
            AND: [{ OR: [{ id: parsed.data.networkId }, { networkId: parsed.data.networkId }] }, ownedWhere(auth.user)]
          }
        })
      : null;
    const floatingIp = await prisma.elasticIpAddress.create({
      data: {
        allocationId: createCloudResourceId("address"),
        publicIp: parsed.data.publicIp ?? generatedLabAddress(),
        status: "AVAILABLE",
        networkId: network?.id,
        ...ownerFields(auth.user)
      }
    });

    return NextResponse.json({ floatingIp }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: { code: "DATABASE_UNAVAILABLE", message: "Floating IP management needs PostgreSQL/Neon to be available.", requestId: null } },
      { status: 503 }
    );
  }
}

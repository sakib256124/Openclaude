import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiPermission } from "@/app/api/_utils/auth";
import { ownerFields, ownedWhere } from "@/lib/cloud/ownership";
import { createCloudResourceId } from "@/lib/cloud/resource-ids";
import { prisma } from "@/lib/prisma";

const securityGroupSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  networkId: z.string().trim().min(1).optional()
});

export async function GET() {
  const auth = await requireApiPermission("resources:read");

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const securityGroups = await prisma.securityGroup.findMany({
      where: {
        status: { not: "DELETED" },
        ...ownedWhere(auth.user)
      },
      include: { rules: true, network: true },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ securityGroups });
  } catch {
    return NextResponse.json({ securityGroups: [] });
  }
}

export async function POST(request: Request) {
  const auth = await requireApiPermission("resources:write");

  if (!auth.ok) {
    return auth.response;
  }

  const parsed = securityGroupSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_FAILED", message: "Security group details are invalid.", fieldErrors: parsed.error.flatten().fieldErrors, requestId: null } },
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
    const securityGroup = await prisma.securityGroup.create({
      data: {
        groupId: createCloudResourceId("securityGroup"),
        name: parsed.data.name,
        description: parsed.data.description,
        networkId: network?.id,
        status: "AVAILABLE",
        ...ownerFields(auth.user)
      },
      include: { rules: true, network: true }
    });

    return NextResponse.json({ securityGroup }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: { code: "DATABASE_UNAVAILABLE", message: "Security group management needs PostgreSQL/Neon to be available.", requestId: null } },
      { status: 503 }
    );
  }
}

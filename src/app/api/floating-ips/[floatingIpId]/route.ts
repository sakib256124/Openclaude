import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiPermission } from "@/app/api/_utils/auth";
import { ownedWhere } from "@/lib/cloud/ownership";
import { prisma } from "@/lib/prisma";

const updateFloatingIpSchema = z.object({
  instanceId: z.string().trim().min(1).nullable().optional()
});

type Params = {
  params: Promise<{ floatingIpId: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireApiPermission("resources:write");

  if (!auth.ok) {
    return auth.response;
  }

  const { floatingIpId } = await params;
  const parsed = updateFloatingIpSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_FAILED", message: "Floating IP update is invalid.", fieldErrors: parsed.error.flatten().fieldErrors, requestId: null } },
      { status: 400 }
    );
  }

  try {
    const instance = parsed.data.instanceId
      ? await prisma.computeInstance.findFirst({
          where: {
            AND: [
              { OR: [{ id: parsed.data.instanceId }, { instanceId: parsed.data.instanceId }, { multipassName: parsed.data.instanceId }] },
              ownedWhere(auth.user)
            ]
          }
        })
      : null;
    const floatingIp = await prisma.elasticIpAddress.updateMany({
      where: { AND: [{ OR: [{ id: floatingIpId }, { allocationId: floatingIpId }, { publicIp: floatingIpId }] }, ownedWhere(auth.user)] },
      data: {
        instanceId: instance?.id ?? null,
        status: instance ? "ASSOCIATED" : "AVAILABLE"
      }
    });

    return NextResponse.json({ ok: floatingIp.count > 0 });
  } catch {
    return NextResponse.json(
      { error: { code: "DATABASE_UNAVAILABLE", message: "Floating IP management needs PostgreSQL/Neon to be available.", requestId: null } },
      { status: 503 }
    );
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireApiPermission("resources:write");

  if (!auth.ok) {
    return auth.response;
  }

  const { floatingIpId } = await params;

  try {
    const floatingIp = await prisma.elasticIpAddress.updateMany({
      where: { AND: [{ OR: [{ id: floatingIpId }, { allocationId: floatingIpId }, { publicIp: floatingIpId }] }, ownedWhere(auth.user)] },
      data: {
        instanceId: null,
        status: "RELEASED"
      }
    });

    return NextResponse.json({ ok: floatingIp.count > 0 });
  } catch {
    return NextResponse.json(
      { error: { code: "DATABASE_UNAVAILABLE", message: "Floating IP management needs PostgreSQL/Neon to be available.", requestId: null } },
      { status: 503 }
    );
  }
}

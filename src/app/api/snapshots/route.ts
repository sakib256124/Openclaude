import { NextResponse } from "next/server";
import { z } from "zod";
import { ownerFields, ownedWhere } from "@/lib/cloud/ownership";
import { createCloudResourceId } from "@/lib/cloud/resource-ids";
import { prisma } from "@/lib/prisma";
import { requireApiPermission } from "@/app/api/_utils/auth";

const createSnapshotSchema = z.object({
  name: z.string().trim().min(1).max(120),
  volumeId: z.string().trim().min(1).optional(),
  instanceId: z.string().trim().min(1).optional(),
  sizeGb: z.coerce.number().int().min(1).max(1024).optional()
});

export async function GET() {
  const auth = await requireApiPermission("resources:read");

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const snapshots = await prisma.snapshot.findMany({
      where: {
        status: { not: "DELETED" },
        ...ownedWhere(auth.user)
      },
      include: { volume: true, sourceInstance: true },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ snapshots });
  } catch {
    return NextResponse.json({ snapshots: [] });
  }
}

export async function POST(request: Request) {
  const auth = await requireApiPermission("resources:write");

  if (!auth.ok) {
    return auth.response;
  }

  const parsed = createSnapshotSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success || (!parsed.data.volumeId && !parsed.data.instanceId)) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_FAILED",
          message: "Snapshot needs a volumeId or instanceId.",
          fieldErrors: parsed.success ? {} : parsed.error.flatten().fieldErrors,
          requestId: null
        }
      },
      { status: 400 }
    );
  }

  try {
    const volume = parsed.data.volumeId
      ? await prisma.volume.findFirst({ where: { OR: [{ id: parsed.data.volumeId }, { volumeId: parsed.data.volumeId }, { name: parsed.data.volumeId }] } })
      : null;
    const instance = parsed.data.instanceId
      ? await prisma.computeInstance.findFirst({
          where: { OR: [{ id: parsed.data.instanceId }, { instanceId: parsed.data.instanceId }, { multipassName: parsed.data.instanceId }] }
        })
      : null;

    const snapshot = await prisma.snapshot.create({
      data: {
        snapshotId: createCloudResourceId("snapshot"),
        name: parsed.data.name,
        status: "COMPLETED",
        sizeGb: parsed.data.sizeGb ?? volume?.sizeGb ?? instance?.storageGb ?? 1,
        volumeId: volume?.id,
        sourceInstanceId: instance?.id,
        ...ownerFields(auth.user)
      }
    });

    return NextResponse.json({ snapshot }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: { code: "DATABASE_UNAVAILABLE", message: "Snapshot management needs PostgreSQL/Neon to be available.", requestId: null } },
      { status: 503 }
    );
  }
}

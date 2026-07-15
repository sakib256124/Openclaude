import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiPermission } from "@/app/api/_utils/auth";
import { prisma } from "@/lib/prisma";

const attachSchema = z.object({
  instanceId: z.string().trim().min(1),
  mountPath: z.string().trim().min(1).max(200).default("/mnt/opencloud-volume")
});

type Params = {
  params: Promise<{ volumeId: string }>;
};

export async function POST(request: Request, { params }: Params) {
  const auth = await requireApiPermission("resources:write");

  if (!auth.ok) {
    return auth.response;
  }

  const { volumeId } = await params;
  const parsed = attachSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_FAILED", message: "Volume attach request is invalid.", fieldErrors: parsed.error.flatten().fieldErrors, requestId: null } },
      { status: 400 }
    );
  }

  try {
    const instance = await prisma.computeInstance.findFirst({
      where: { OR: [{ id: parsed.data.instanceId }, { instanceId: parsed.data.instanceId }, { multipassName: parsed.data.instanceId }] }
    });

    if (!instance) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Instance was not found.", requestId: null } }, { status: 404 });
    }

    const volume = await prisma.volume.updateMany({
      where: { OR: [{ id: volumeId }, { volumeId }] },
      data: {
        status: "IN_USE",
        attachedInstanceId: instance.id,
        mountPath: parsed.data.mountPath
      }
    });

    return NextResponse.json({ ok: volume.count > 0 });
  } catch {
    return NextResponse.json(
      { error: { code: "DATABASE_UNAVAILABLE", message: "Volume management needs PostgreSQL/Neon to be available.", requestId: null } },
      { status: 503 }
    );
  }
}

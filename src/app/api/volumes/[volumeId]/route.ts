import { NextResponse } from "next/server";
import { requireApiPermission } from "@/app/api/_utils/auth";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ volumeId: string }>;
};

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireApiPermission("resources:write");

  if (!auth.ok) {
    return auth.response;
  }

  const { volumeId } = await params;

  try {
    await prisma.volume.updateMany({
      where: { OR: [{ id: volumeId }, { volumeId }] },
      data: {
        status: "DELETED",
        attachedInstanceId: null,
        mountPath: null
      }
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: { code: "DATABASE_UNAVAILABLE", message: "Volume management needs PostgreSQL/Neon to be available.", requestId: null } },
      { status: 503 }
    );
  }
}

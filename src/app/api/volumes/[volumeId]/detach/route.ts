import { NextResponse } from "next/server";
import { requireApiPermission } from "@/app/api/_utils/auth";
import { ownedWhere } from "@/lib/cloud/ownership";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ volumeId: string }>;
};

export async function POST(_request: Request, { params }: Params) {
  const auth = await requireApiPermission("resources:write");

  if (!auth.ok) {
    return auth.response;
  }

  const { volumeId } = await params;

  try {
    const volume = await prisma.volume.updateMany({
      where: { AND: [{ OR: [{ id: volumeId }, { volumeId }] }, ownedWhere(auth.user)] },
      data: {
        status: "AVAILABLE",
        attachedInstanceId: null,
        mountPath: null
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

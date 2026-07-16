import { NextResponse } from "next/server";
import { requireApiPermission } from "@/app/api/_utils/auth";
import { ownedWhere } from "@/lib/cloud/ownership";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ snapshotId: string }>;
};

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireApiPermission("resources:write");

  if (!auth.ok) {
    return auth.response;
  }

  const { snapshotId } = await params;

  try {
    const result = await prisma.snapshot.updateMany({
      where: { AND: [{ OR: [{ id: snapshotId }, { snapshotId }] }, ownedWhere(auth.user)] },
      data: { status: "DELETED" }
    });

    return NextResponse.json({ ok: result.count > 0 });
  } catch {
    return NextResponse.json(
      { error: { code: "DATABASE_UNAVAILABLE", message: "Snapshot management needs PostgreSQL/Neon to be available.", requestId: null } },
      { status: 503 }
    );
  }
}

import { NextResponse } from "next/server";
import { requireApiPermission } from "@/app/api/_utils/auth";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ groupId: string }>;
};

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireApiPermission("resources:write");

  if (!auth.ok) {
    return auth.response;
  }

  const { groupId } = await params;

  try {
    const result = await prisma.securityGroup.updateMany({
      where: { OR: [{ id: groupId }, { groupId }] },
      data: { status: "DELETED" }
    });

    return NextResponse.json({ ok: result.count > 0 });
  } catch {
    return NextResponse.json(
      { error: { code: "DATABASE_UNAVAILABLE", message: "Security group management needs PostgreSQL/Neon to be available.", requestId: null } },
      { status: 503 }
    );
  }
}

import { NextResponse } from "next/server";
import { requireApiPermission } from "@/app/api/_utils/auth";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ keyPairId: string }>;
};

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireApiPermission("resources:write");

  if (!auth.ok) {
    return auth.response;
  }

  const { keyPairId } = await params;

  try {
    const result = await prisma.keyPair.deleteMany({
      where: { OR: [{ id: keyPairId }, { keyPairId }, { name: keyPairId }] }
    });

    return NextResponse.json({ ok: result.count > 0 });
  } catch {
    return NextResponse.json(
      { error: { code: "DATABASE_UNAVAILABLE", message: "Key pair registry needs PostgreSQL/Neon to be available.", requestId: null } },
      { status: 503 }
    );
  }
}

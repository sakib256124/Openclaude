import { NextResponse } from "next/server";
import { requireApiPermission } from "@/app/api/_utils/auth";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ imageId: string }>;
};

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireApiPermission("resources:write");

  if (!auth.ok) {
    return auth.response;
  }

  const { imageId } = await params;

  try {
    const result = await prisma.machineImage.updateMany({
      where: { OR: [{ id: imageId }, { imageId }, { slug: imageId }] },
      data: { status: "DELETED" }
    });

    return NextResponse.json({ ok: result.count > 0 });
  } catch {
    return NextResponse.json(
      { error: { code: "DATABASE_UNAVAILABLE", message: "Image registry needs PostgreSQL/Neon to be available.", requestId: null } },
      { status: 503 }
    );
  }
}

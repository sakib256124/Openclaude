import { NextResponse } from "next/server";
import { requireApiPermission } from "@/app/api/_utils/auth";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ groupId: string; ruleId: string }>;
};

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireApiPermission("resources:write");

  if (!auth.ok) {
    return auth.response;
  }

  const { ruleId } = await params;

  try {
    const rule = await prisma.firewallRule.deleteMany({
      where: { OR: [{ id: ruleId }, { ruleId }] }
    });

    return NextResponse.json({ ok: rule.count > 0 });
  } catch {
    return NextResponse.json(
      { error: { code: "DATABASE_UNAVAILABLE", message: "Firewall rules need PostgreSQL/Neon to be available.", requestId: null } },
      { status: 503 }
    );
  }
}

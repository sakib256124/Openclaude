import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiPermission } from "@/app/api/_utils/auth";
import { ownedWhere } from "@/lib/cloud/ownership";
import { createCloudResourceId } from "@/lib/cloud/resource-ids";
import { prisma } from "@/lib/prisma";

const ruleSchema = z.object({
  direction: z.enum(["INGRESS", "EGRESS"]).default("INGRESS"),
  protocol: z.enum(["TCP", "UDP", "ICMP", "ALL"]).default("TCP"),
  fromPort: z.coerce.number().int().min(0).max(65535).optional(),
  toPort: z.coerce.number().int().min(0).max(65535).optional(),
  cidr: z.string().trim().regex(/^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/).default("0.0.0.0/0"),
  description: z.string().trim().max(500).optional()
});

type Params = {
  params: Promise<{ groupId: string }>;
};

export async function POST(request: Request, { params }: Params) {
  const auth = await requireApiPermission("resources:write");

  if (!auth.ok) {
    return auth.response;
  }

  const { groupId } = await params;
  const parsed = ruleSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_FAILED", message: "Firewall rule details are invalid.", fieldErrors: parsed.error.flatten().fieldErrors, requestId: null } },
      { status: 400 }
    );
  }

  try {
    const securityGroup = await prisma.securityGroup.findFirst({
      where: { AND: [{ OR: [{ id: groupId }, { groupId }] }, ownedWhere(auth.user)] }
    });

    if (!securityGroup) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Security group was not found.", requestId: null } }, { status: 404 });
    }

    const rule = await prisma.firewallRule.create({
      data: {
        ruleId: createCloudResourceId("rule"),
        securityGroupId: securityGroup.id,
        direction: parsed.data.direction,
        protocol: parsed.data.protocol,
        fromPort: parsed.data.fromPort,
        toPort: parsed.data.toPort ?? parsed.data.fromPort,
        cidr: parsed.data.cidr,
        description: parsed.data.description
      }
    });

    return NextResponse.json({ rule }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: { code: "DATABASE_UNAVAILABLE", message: "Firewall rules need PostgreSQL/Neon to be available.", requestId: null } },
      { status: 503 }
    );
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiPermission } from "@/app/api/_utils/auth";
import { ownerFields, ownedWhere } from "@/lib/cloud/ownership";
import { createCloudResourceId } from "@/lib/cloud/resource-ids";
import { prisma } from "@/lib/prisma";

const createVolumeSchema = z.object({
  name: z.string().trim().min(1).max(120),
  sizeGb: z.coerce.number().int().min(1).max(1024),
  availabilityZone: z.string().trim().min(1).max(80).default("local")
});

export async function GET() {
  const auth = await requireApiPermission("resources:read");

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const volumes = await prisma.volume.findMany({
      where: {
        status: { not: "DELETED" },
        ...ownedWhere(auth.user)
      },
      include: { attachedInstance: true },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ volumes });
  } catch {
    return NextResponse.json({ volumes: [] });
  }
}

export async function POST(request: Request) {
  const auth = await requireApiPermission("resources:write");

  if (!auth.ok) {
    return auth.response;
  }

  const parsed = createVolumeSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_FAILED", message: "Volume details are invalid.", fieldErrors: parsed.error.flatten().fieldErrors, requestId: null } },
      { status: 400 }
    );
  }

  try {
    const volume = await prisma.volume.create({
      data: {
        volumeId: createCloudResourceId("volume"),
        name: parsed.data.name,
        sizeGb: parsed.data.sizeGb,
        availabilityZone: parsed.data.availabilityZone,
        status: "AVAILABLE",
        ...ownerFields(auth.user)
      }
    });

    return NextResponse.json({ volume }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: { code: "DATABASE_UNAVAILABLE", message: "Volume management needs PostgreSQL/Neon to be available.", requestId: null } },
      { status: 503 }
    );
  }
}

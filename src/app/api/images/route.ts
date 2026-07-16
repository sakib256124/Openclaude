import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiPermission } from "@/app/api/_utils/auth";
import { createCloudResourceId } from "@/lib/cloud/resource-ids";
import { ownedWhere, ownerFields } from "@/lib/cloud/ownership";
import { multipassImageCatalog } from "@/lib/multipass/catalog";
import { prisma } from "@/lib/prisma";

const createImageSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().regex(/^[a-z0-9][a-z0-9.-]{1,118}[a-z0-9]$/).optional(),
  operatingSystem: z.string().trim().min(1).max(80).default("Ubuntu"),
  version: z.string().trim().max(40).optional(),
  architecture: z.string().trim().max(40).default("x86_64"),
  sourceInstanceId: z.string().trim().min(1).optional(),
  description: z.string().trim().max(500).optional()
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export async function GET() {
  const auth = await requireApiPermission("resources:read");

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const customImages = await prisma.machineImage.findMany({
      where: {
        status: { not: "DELETED" },
        OR: [{ visibility: "PUBLIC" }, ownedWhere(auth.user)]
      },
      orderBy: [{ visibility: "asc" }, { createdAt: "desc" }]
    });

    return NextResponse.json({
      images: [
        ...multipassImageCatalog.map((image) => ({
          imageId: `ami-multipass-${image.alias}`,
          name: image.name,
          slug: image.alias,
          operatingSystem: image.name.split(" ")[0],
          version: image.alias,
          visibility: "PUBLIC",
          status: "AVAILABLE",
          release: image.release,
          default: image.default,
          source: "multipass"
        })),
        ...customImages.map((image) => ({ ...image, source: "database" }))
      ]
    });
  } catch {
    return NextResponse.json({ images: multipassImageCatalog.map((image) => ({ ...image, source: "multipass" })) });
  }
}

export async function POST(request: Request) {
  const auth = await requireApiPermission("resources:write");

  if (!auth.ok) {
    return auth.response;
  }

  const parsed = createImageSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_FAILED", message: "Image details are invalid.", fieldErrors: parsed.error.flatten().fieldErrors, requestId: null } },
      { status: 400 }
    );
  }

  try {
    const sourceInstance = parsed.data.sourceInstanceId
      ? await prisma.computeInstance.findFirst({
          where: {
            AND: [
              { OR: [{ id: parsed.data.sourceInstanceId }, { instanceId: parsed.data.sourceInstanceId }, { multipassName: parsed.data.sourceInstanceId }] },
              ownedWhere(auth.user)
            ]
          }
        })
      : null;
    const image = await prisma.machineImage.create({
      data: {
        imageId: createCloudResourceId("image"),
        name: parsed.data.name,
        slug: parsed.data.slug ?? `${slugify(parsed.data.name)}-${Date.now().toString(36)}`,
        operatingSystem: sourceInstance?.operatingSystem ?? parsed.data.operatingSystem,
        version: parsed.data.version,
        architecture: parsed.data.architecture,
        visibility: "PRIVATE",
        status: "AVAILABLE",
        sourceInstanceId: sourceInstance?.instanceId ?? parsed.data.sourceInstanceId,
        description: parsed.data.description,
        metadata: sourceInstance ? { sourceInstanceName: sourceInstance.name } : undefined,
        ...ownerFields(auth.user)
      }
    });

    return NextResponse.json({ image }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: { code: "DATABASE_UNAVAILABLE", message: "Image registry needs PostgreSQL/Neon to be available.", requestId: null } },
      { status: 503 }
    );
  }
}

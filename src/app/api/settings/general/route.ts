import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generalSettingsSchema } from "@/lib/validators";
import { requireApiPermission } from "@/app/api/_utils/auth";
import { recordActivity } from "@/lib/audit-log";

const defaultSettingsId = "default";

export async function GET() {
  const auth = await requireApiPermission("settings:manage");

  if (!auth.ok) {
    return auth.response;
  }

  const settings = await prisma.applicationSetting.upsert({
    where: { id: defaultSettingsId },
    update: {},
    create: { id: defaultSettingsId }
  });

  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
  const auth = await requireApiPermission("settings:manage");

  if (!auth.ok) {
    return auth.response;
  }

  const parsed = generalSettingsSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Settings are invalid.",
          fieldErrors: parsed.error.flatten().fieldErrors,
          requestId: null
        }
      },
      { status: 400 }
    );
  }

  const settings = await prisma.applicationSetting.upsert({
    where: { id: defaultSettingsId },
    update: parsed.data,
    create: { id: defaultSettingsId, ...parsed.data }
  });

  await recordActivity({
    userId: auth.user.id,
    action: "settings.update",
    resourceType: "application_setting",
    resourceId: settings.id,
    service: "auth",
    status: "SUCCESS",
    safeMessage: "Application settings updated.",
    metadata: { changedFields: Object.keys(parsed.data) }
  });

  return NextResponse.json({ settings });
}

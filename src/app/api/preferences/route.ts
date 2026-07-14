import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { userPreferenceSchema } from "@/lib/validators";
import { requireApiPermission } from "@/app/api/_utils/auth";

export async function GET() {
  const auth = await requireApiPermission("preferences:manage");

  if (!auth.ok) {
    return auth.response;
  }

  const preferences = await prisma.userPreference.upsert({
    where: { userId: auth.user.id },
    update: {},
    create: { userId: auth.user.id }
  });

  return NextResponse.json({ preferences });
}

export async function PATCH(request: Request) {
  const auth = await requireApiPermission("preferences:manage");

  if (!auth.ok) {
    return auth.response;
  }

  const parsed = userPreferenceSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Preferences are invalid.",
          fieldErrors: parsed.error.flatten().fieldErrors,
          requestId: null
        }
      },
      { status: 400 }
    );
  }

  const data = parsed.data as Prisma.UserPreferenceUncheckedUpdateInput;
  const createData = {
    ...data,
    userId: auth.user.id
  } as Prisma.UserPreferenceUncheckedCreateInput;
  const preferences = await prisma.userPreference.upsert({
    where: { userId: auth.user.id },
    update: data,
    create: createData
  });

  return NextResponse.json({ preferences });
}

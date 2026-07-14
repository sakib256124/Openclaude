import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateUserSchema } from "@/lib/validators";
import { requireApiPermission } from "@/app/api/_utils/auth";
import { recordActivity } from "@/lib/audit-log";

type Params = {
  params: Promise<{ userId: string }>;
};

async function wouldRemoveFinalActiveAdmin(userId: string, nextRole?: string, nextIsActive?: boolean) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, isActive: true }
  });

  if (!user || user.role !== "ADMIN" || !user.isActive) {
    return false;
  }

  const willRemainAdmin = (nextRole ?? user.role) === "ADMIN";
  const willRemainActive = nextIsActive ?? user.isActive;

  if (willRemainAdmin && willRemainActive) {
    return false;
  }

  const activeAdminCount = await prisma.user.count({
    where: { role: "ADMIN", isActive: true }
  });

  return activeAdminCount <= 1;
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireApiPermission("users:manage");

  if (!auth.ok) {
    return auth.response;
  }

  const { userId } = await params;
  const parsed = updateUserSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "User update is invalid.",
          fieldErrors: parsed.error.flatten().fieldErrors,
          requestId: null
        }
      },
      { status: 400 }
    );
  }

  if (await wouldRemoveFinalActiveAdmin(userId, parsed.data.role, parsed.data.isActive)) {
    return NextResponse.json(
      {
        error: {
          code: "FINAL_ADMIN_REQUIRED",
          message: "At least one active ADMIN account must remain.",
          requestId: null
        }
      },
      { status: 409 }
    );
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: parsed.data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true
    }
  });

  await recordActivity({
    userId: auth.user.id,
    action: "user.update",
    resourceType: "user",
    resourceId: user.id,
    resourceName: user.email,
    service: "auth",
    status: "SUCCESS",
    safeMessage: "User account updated.",
    metadata: {
      changedFields: Object.keys(parsed.data)
    }
  });

  return NextResponse.json({ user });
}

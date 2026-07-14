import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiPermission } from "@/app/api/_utils/auth";

export async function GET() {
  const auth = await requireApiPermission("preferences:manage");

  if (!auth.ok) {
    return auth.response;
  }

  const [unreadCount, notifications] = await prisma.$transaction([
    prisma.notification.count({ where: { userId: auth.user.id, readAt: null } }),
    prisma.notification.findMany({
      where: { userId: auth.user.id },
      orderBy: { createdAt: "desc" },
      take: 25
    })
  ]);

  return NextResponse.json({ unreadCount, notifications });
}

export async function PATCH(request: Request) {
  const auth = await requireApiPermission("preferences:manage");

  if (!auth.ok) {
    return auth.response;
  }

  const body = (await request.json().catch(() => null)) as { id?: string; markAllRead?: boolean } | null;
  const readAt = new Date();

  if (body?.markAllRead) {
    await prisma.notification.updateMany({
      where: { userId: auth.user.id, readAt: null },
      data: { readAt }
    });

    return NextResponse.json({ ok: true });
  }

  if (!body?.id) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Notification id is required.",
          requestId: null
        }
      },
      { status: 400 }
    );
  }

  await prisma.notification.updateMany({
    where: { id: body.id, userId: auth.user.id },
    data: { readAt }
  });

  return NextResponse.json({ ok: true });
}

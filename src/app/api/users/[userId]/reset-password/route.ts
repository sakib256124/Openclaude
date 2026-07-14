import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { resetPasswordSchema } from "@/lib/validators";
import { requireApiPermission } from "@/app/api/_utils/auth";
import { recordActivity } from "@/lib/audit-log";

type Params = {
  params: Promise<{ userId: string }>;
};

export async function POST(request: Request, { params }: Params) {
  const auth = await requireApiPermission("users:manage");

  if (!auth.ok) {
    return auth.response;
  }

  const { userId } = await params;
  const parsed = resetPasswordSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Password must be at least 12 characters.",
          fieldErrors: parsed.error.flatten().fieldErrors,
          requestId: null
        }
      },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(parsed.data.password) },
    select: { id: true, email: true }
  });

  await recordActivity({
    userId: auth.user.id,
    action: "user.reset_password",
    resourceType: "user",
    resourceId: user.id,
    resourceName: user.email,
    service: "auth",
    status: "SUCCESS",
    safeMessage: "User password reset."
  });

  return NextResponse.json({ ok: true });
}

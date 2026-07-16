import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { completePasswordResetSchema } from "@/lib/validators";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function emailFromIdentifier(identifier: string) {
  return identifier.startsWith("password-reset:") ? identifier.slice("password-reset:".length) : null;
}

export async function POST(request: Request) {
  const parsed = completePasswordResetSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Password reset details are invalid.",
          fieldErrors: parsed.error.flatten().fieldErrors,
          requestId: null
        }
      },
      { status: 400 }
    );
  }

  const hashedToken = hashToken(parsed.data.token);
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token: hashedToken }
  });
  const email = verificationToken ? emailFromIdentifier(verificationToken.identifier) : null;

  if (!verificationToken || !email || verificationToken.expires < new Date()) {
    if (verificationToken) {
      await prisma.verificationToken.deleteMany({ where: { token: hashedToken } });
    }

    return NextResponse.json(
      {
        error: {
          code: "INVALID_TOKEN",
          message: "This reset link is invalid or expired.",
          requestId: null
        }
      },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user?.isActive) {
    await prisma.verificationToken.deleteMany({ where: { token: hashedToken } });
    return NextResponse.json(
      {
        error: {
          code: "INVALID_TOKEN",
          message: "This reset link is invalid or expired.",
          requestId: null
        }
      },
      { status: 400 }
    );
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(parsed.data.password) }
    }),
    prisma.verificationToken.deleteMany({ where: { identifier: verificationToken.identifier } }),
    prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "auth.password_reset_completed",
        resourceType: "user",
        resourceId: user.id,
        resourceName: user.email,
        service: "auth",
        status: "SUCCESS",
        safeMessage: "Password reset completed."
      }
    })
  ]);

  return NextResponse.json({ ok: true });
}

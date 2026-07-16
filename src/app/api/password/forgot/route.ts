import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";

const resetTokenTtlMs = 1000 * 60 * 30;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function buildResetUrl(request: Request, token: string) {
  const url = new URL(request.url);
  const baseUrl = process.env.APP_URL || `${url.protocol}//${url.host}`;
  const resetUrl = new URL("/reset-password", baseUrl);
  resetUrl.searchParams.set("token", token);
  return resetUrl.toString();
}

export async function POST(request: Request) {
  const parsed = forgotPasswordSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Enter a valid account email.",
          fieldErrors: parsed.error.flatten().fieldErrors,
          requestId: null
        }
      },
      { status: 400 }
    );
  }

  const genericResponse: { ok: true; resetUrl?: string } = { ok: true };
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  if (!user?.passwordHash || !user.isActive) {
    return NextResponse.json(genericResponse);
  }

  const token = randomBytes(32).toString("base64url");
  const hashedToken = hashToken(token);

  await prisma.$transaction([
    prisma.verificationToken.deleteMany({ where: { identifier: `password-reset:${user.email}` } }),
    prisma.verificationToken.create({
      data: {
        identifier: `password-reset:${user.email}`,
        token: hashedToken,
        expires: new Date(Date.now() + resetTokenTtlMs)
      }
    }),
    prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "auth.password_reset_requested",
        resourceType: "user",
        resourceId: user.id,
        resourceName: user.email,
        service: "auth",
        status: "SUCCESS",
        safeMessage: "Password reset requested."
      }
    })
  ]);

  if (process.env.NODE_ENV !== "production" || process.env.EXPOSE_PASSWORD_RESET_LINK === "true") {
    genericResponse.resetUrl = buildResetUrl(request, token);
  }

  return NextResponse.json(genericResponse);
}

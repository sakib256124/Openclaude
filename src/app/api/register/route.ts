import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { registerUserSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const parsed = registerUserSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Registration details are invalid.",
          fieldErrors: parsed.error.flatten().fieldErrors,
          requestId: null
        }
      },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email }
  });

  if (existing) {
    return NextResponse.json(
      {
        error: {
          code: "EMAIL_IN_USE",
          message: "An account with this email already exists.",
          requestId: null
        }
      },
      { status: 409 }
    );
  }

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
      role: "USER",
      isActive: true,
      preferences: {
        create: {}
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  });

  return NextResponse.json({ user }, { status: 201 });
}

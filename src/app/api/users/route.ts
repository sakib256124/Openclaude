import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { createUserSchema } from "@/lib/validators";
import { requireApiPermission } from "@/app/api/_utils/auth";
import { recordActivity } from "@/lib/audit-log";

function serializeUser(user: {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

export async function GET() {
  const auth = await requireApiPermission("users:manage");

  if (!auth.ok) {
    return auth.response;
  }

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { email: "asc" }],
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

  return NextResponse.json({ users: users.map(serializeUser) });
}

export async function POST(request: Request) {
  const auth = await requireApiPermission("users:manage");

  if (!auth.ok) {
    return auth.response;
  }

  const parsed = createUserSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "User details are invalid.",
          fieldErrors: parsed.error.flatten().fieldErrors,
          requestId: null
        }
      },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  if (existing) {
    return NextResponse.json(
      {
        error: {
          code: "EMAIL_IN_USE",
          message: "A user with this email already exists.",
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
      role: parsed.data.role,
      isActive: parsed.data.isActive,
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
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true
    }
  });

  await recordActivity({
    userId: auth.user.id,
    action: "user.create",
    resourceType: "user",
    resourceId: user.id,
    resourceName: user.email,
    service: "auth",
    status: "SUCCESS",
    safeMessage: "User account created.",
    metadata: { role: user.role, isActive: user.isActive }
  });

  return NextResponse.json({ user: serializeUser(user) }, { status: 201 });
}

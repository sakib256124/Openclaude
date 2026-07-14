import { NextResponse } from "next/server";
import { getCurrentUser, type AppSessionUser } from "@/lib/auth";
import { hasPermission, type Permission } from "@/lib/permissions";

export type ApiAuthResult =
  | { ok: true; user: AppSessionUser }
  | { ok: false; response: NextResponse };

export async function requireApiPermission(permission: Permission): Promise<ApiAuthResult> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: {
            code: "UNAUTHENTICATED",
            message: "Sign in is required.",
            requestId: null
          }
        },
        { status: 401 }
      )
    };
  }

  if (!hasPermission(user.role, permission)) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: {
            code: "FORBIDDEN",
            message: "Your role does not allow this action.",
            requestId: null
          }
        },
        { status: 403 }
      )
    };
  }

  return { ok: true, user };
}

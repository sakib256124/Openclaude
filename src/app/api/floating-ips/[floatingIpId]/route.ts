import { NextResponse } from "next/server";
import { requireApiPermission } from "@/app/api/_utils/auth";

export async function PATCH() {
  const auth = await requireApiPermission("resources:write");

  if (!auth.ok) {
    return auth.response;
  }

  return NextResponse.json(
    { error: { code: "UNSUPPORTED_BY_MULTIPASS", message: "Multipass does not associate floating IPs.", requestId: null } },
    { status: 400 }
  );
}

export async function DELETE() {
  const auth = await requireApiPermission("resources:write");

  if (!auth.ok) {
    return auth.response;
  }

  return NextResponse.json(
    { error: { code: "UNSUPPORTED_BY_MULTIPASS", message: "Multipass does not release floating IPs.", requestId: null } },
    { status: 400 }
  );
}

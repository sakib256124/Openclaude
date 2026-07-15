import { NextResponse } from "next/server";
import { requireApiPermission } from "@/app/api/_utils/auth";

export async function GET() {
  const auth = await requireApiPermission("resources:read");

  if (!auth.ok) {
    return auth.response;
  }

  return NextResponse.json({
    securityGroups: [],
    capability: "Use Ubuntu firewall rules on the host or inside each VM for Multipass labs."
  });
}

export async function POST() {
  const auth = await requireApiPermission("resources:write");

  if (!auth.ok) {
    return auth.response;
  }

  return NextResponse.json(
    { error: { code: "UNSUPPORTED_BY_MULTIPASS", message: "Multipass does not provide security-group APIs.", requestId: null } },
    { status: 400 }
  );
}

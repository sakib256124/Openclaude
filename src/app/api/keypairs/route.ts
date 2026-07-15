import { NextResponse } from "next/server";
import { requireApiPermission } from "@/app/api/_utils/auth";

export async function GET() {
  const auth = await requireApiPermission("resources:read");

  if (!auth.ok) {
    return auth.response;
  }

  return NextResponse.json({
    keyPairs: [],
    capability: "Multipass uses the local user's SSH trust and cloud-init files rather than a cloud key-pair registry."
  });
}

export async function POST() {
  const auth = await requireApiPermission("resources:write");

  if (!auth.ok) {
    return auth.response;
  }

  return NextResponse.json(
    { error: { code: "UNSUPPORTED_BY_MULTIPASS", message: "Create SSH keys on Ubuntu and pass them through cloud-init.", requestId: null } },
    { status: 400 }
  );
}

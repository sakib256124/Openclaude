import { NextResponse } from "next/server";
import { requireApiPermission } from "@/app/api/_utils/auth";

export async function GET() {
  const auth = await requireApiPermission("resources:read");

  if (!auth.ok) {
    return auth.response;
  }

  return NextResponse.json({
    networks: [
      {
        name: "multipass-nat",
        cidr: "managed-by-multipass",
        status: "UP",
        description: "Default Multipass bridge/NAT network on the Ubuntu host."
      }
    ]
  });
}

import { NextResponse } from "next/server";
import { requireApiPermission } from "@/app/api/_utils/auth";
import { multipassFlavorCatalog } from "@/lib/multipass/catalog";

export async function GET() {
  const auth = await requireApiPermission("resources:read");

  if (!auth.ok) {
    return auth.response;
  }

  return NextResponse.json({ flavors: multipassFlavorCatalog });
}

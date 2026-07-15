import { NextResponse } from "next/server";
import { requireApiPermission } from "@/app/api/_utils/auth";
import { multipassErrorResponse } from "@/app/api/_utils/multipass";
import { deleteMultipassInstance, getMultipassInstance } from "@/lib/multipass/multipass-cli";
import { normalizeMultipassName } from "@/lib/multipass/normalizers";

type Params = {
  params: Promise<{ instanceId: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireApiPermission("resources:read");

  if (!auth.ok) {
    return auth.response;
  }

  const { instanceId } = await params;
  const name = normalizeMultipassName(instanceId);

  if (!name) {
    return NextResponse.json({ error: { code: "VALIDATION_FAILED", message: "Invalid instance name.", requestId: null } }, { status: 400 });
  }

  try {
    const instance = await getMultipassInstance(name);

    if (!instance) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Instance was not found.", requestId: null } }, { status: 404 });
    }

    return NextResponse.json({ instance });
  } catch (error) {
    return multipassErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireApiPermission("resources:write");

  if (!auth.ok) {
    return auth.response;
  }

  const { instanceId } = await params;
  const name = normalizeMultipassName(instanceId);

  if (!name) {
    return NextResponse.json({ error: { code: "VALIDATION_FAILED", message: "Invalid instance name.", requestId: null } }, { status: 400 });
  }

  try {
    await deleteMultipassInstance(name);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return multipassErrorResponse(error);
  }
}

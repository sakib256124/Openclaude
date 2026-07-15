import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiPermission } from "@/app/api/_utils/auth";
import { multipassErrorResponse } from "@/app/api/_utils/multipass";
import { runMultipassInstanceAction } from "@/lib/multipass/multipass-cli";
import { normalizeMultipassName } from "@/lib/multipass/normalizers";

const actionSchema = z.object({
  action: z.enum(["start", "stop", "restart", "suspend"])
});

type Params = {
  params: Promise<{ instanceId: string }>;
};

export async function POST(request: Request, { params }: Params) {
  const auth = await requireApiPermission("resources:write");

  if (!auth.ok) {
    return auth.response;
  }

  const { instanceId } = await params;
  const name = normalizeMultipassName(instanceId);
  const parsed = actionSchema.safeParse(await request.json().catch(() => null));

  if (!name || !parsed.success) {
    return NextResponse.json({ error: { code: "VALIDATION_FAILED", message: "Invalid Multipass action request.", requestId: null } }, { status: 400 });
  }

  try {
    const instance = await runMultipassInstanceAction(name, parsed.data.action);
    return NextResponse.json({ instance });
  } catch (error) {
    return multipassErrorResponse(error);
  }
}

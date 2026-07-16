import { NextResponse } from "next/server";
import { requireApiPermission } from "@/app/api/_utils/auth";
import { multipassErrorResponse } from "@/app/api/_utils/multipass";
import type { AppSessionUser } from "@/lib/auth";
import { ownedWhere } from "@/lib/cloud/ownership";
import { markInstanceTerminated } from "@/lib/cloud/instances";
import { OpenCloudError } from "@/lib/multipass/errors";
import { deleteLocalInstance, getLocalInstance } from "@/lib/multipass/local-store";
import { deleteMultipassInstance, getMultipassInstance } from "@/lib/multipass/multipass-cli";
import { normalizeMultipassName } from "@/lib/multipass/normalizers";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ instanceId: string }>;
};

async function getOwnedInstanceRecord(name: string, user: AppSessionUser) {
  return prisma.computeInstance.findFirst({
    where: { AND: [{ OR: [{ multipassName: name }, { name }, { instanceId: name }] }, ownedWhere(user)] },
    include: {
      owner: { select: { name: true, email: true } },
      network: { select: { networkId: true, name: true, cidr: true } },
      securityGroup: { select: { groupId: true, name: true } },
      image: { select: { imageId: true, name: true, slug: true } }
    }
  });
}

function mergeInstanceRecord(runtime: Awaited<ReturnType<typeof getMultipassInstance>>, record: Awaited<ReturnType<typeof getOwnedInstanceRecord>>) {
  if (!runtime) {
    return null;
  }

  return {
    ...runtime,
    instanceId: record?.instanceId,
    status: record?.status,
    cpu: record?.cpu,
    ramMb: record?.ramMb,
    storageGb: record?.storageGb,
    privateIp: record?.privateIp ?? runtime.ipv4[0] ?? null,
    publicIp: record?.publicIp,
    availabilityZone: record?.availabilityZone,
    ownerEmail: record?.ownerEmail,
    ownerName: record?.owner?.name ?? null,
    network: record?.network,
    securityGroup: record?.securityGroup,
    image: record?.image,
    launchedAt: record?.launchedAt?.toISOString() ?? null,
    createdAt: record?.createdAt?.toISOString() ?? null,
    updatedAt: record?.updatedAt?.toISOString() ?? null
  };
}

function databaseUnavailableResponse() {
  return NextResponse.json(
    { error: { code: "DATABASE_UNAVAILABLE", message: "Instance records need PostgreSQL/Neon to be available.", requestId: null } },
    { status: 503 }
  );
}

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

  let record: Awaited<ReturnType<typeof getOwnedInstanceRecord>>;

  try {
    record = await getOwnedInstanceRecord(name, auth.user);
  } catch {
    return databaseUnavailableResponse();
  }

  if (!record) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Instance was not found.", requestId: null } }, { status: 404 });
  }

  try {
    const instance = await getMultipassInstance(name);

    if (!instance) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Instance was not found.", requestId: null } }, { status: 404 });
    }

    return NextResponse.json({ instance: mergeInstanceRecord(instance, record) });
  } catch (error) {
    if (error instanceof OpenCloudError && error.code === "SERVICE_UNAVAILABLE") {
      const instance = getLocalInstance(name);

      if (!instance) {
        return NextResponse.json({ error: { code: "NOT_FOUND", message: "Instance was not found.", requestId: null } }, { status: 404 });
      }

      return NextResponse.json({ source: "local", instance: mergeInstanceRecord(instance, record) });
    }

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

  let record: Awaited<ReturnType<typeof getOwnedInstanceRecord>>;

  try {
    record = await getOwnedInstanceRecord(name, auth.user);
  } catch {
    return databaseUnavailableResponse();
  }

  if (!record) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Instance was not found.", requestId: null } }, { status: 404 });
  }

  try {
    await deleteMultipassInstance(name);
    await markInstanceTerminated(name, auth.user);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof OpenCloudError && error.code === "SERVICE_UNAVAILABLE") {
      const ok = deleteLocalInstance(name);
      await markInstanceTerminated(name, auth.user);
      return NextResponse.json({ ok, source: "local" });
    }

    return multipassErrorResponse(error);
  }
}

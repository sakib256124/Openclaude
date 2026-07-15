import "server-only";
import type { ComputeInstance, ComputeInstanceStatus, Prisma } from "@prisma/client";
import type { AppSessionUser } from "@/lib/auth";
import { createCloudResourceId } from "@/lib/cloud/resource-ids";
import type { MultipassInstance, MultipassLaunchInput } from "@/lib/multipass/types";
import { prisma } from "@/lib/prisma";

type LaunchRecordInput = {
  user: AppSessionUser;
  launch: MultipassLaunchInput;
  runtime: MultipassInstance | null;
};

type ActionRecordInput = {
  name: string;
  runtime: MultipassInstance | null;
  fallbackStatus?: ComputeInstanceStatus;
};

function isPersistableUser(user: AppSessionUser) {
  return !user.id.startsWith("local-user-");
}

function ownerFields(user: AppSessionUser) {
  return {
    ownerUserId: isPersistableUser(user) ? user.id : null,
    ownerEmail: user.email
  };
}

function memoryToMb(value?: string) {
  if (!value) {
    return Number(process.env.MULTIPASS_DEFAULT_MEMORY?.match(/^\d+/)?.[0] ?? 2) * 1024;
  }

  const match = value.match(/^(\d+)([MG])$/i);

  if (!match) {
    return 2048;
  }

  const amount = Number(match[1]);
  return match[2].toUpperCase() === "G" ? amount * 1024 : amount;
}

function diskToGb(value?: string) {
  if (!value) {
    return Number(process.env.MULTIPASS_DEFAULT_DISK?.match(/^\d+/)?.[0] ?? 10);
  }

  const match = value.match(/^(\d+)([MG])$/i);

  if (!match) {
    return 10;
  }

  const amount = Number(match[1]);
  return match[2].toUpperCase() === "G" ? amount : Math.max(1, Math.ceil(amount / 1024));
}

function runtimeStatus(state?: MultipassInstance["state"]): ComputeInstanceStatus {
  switch (state) {
    case "Running":
    case "Starting":
      return "RUNNING";
    case "Stopped":
      return "STOPPED";
    case "Suspended":
      return "SUSPENDED";
    case "Deleted":
      return "TERMINATED";
    default:
      return "ERROR";
  }
}

function instanceApiShape(record: ComputeInstance | null, runtime: MultipassInstance) {
  return {
    ...runtime,
    instanceId: record?.instanceId,
    ownerEmail: record?.ownerEmail,
    status: record?.status,
    cpu: record?.cpu,
    ramMb: record?.ramMb,
    storageGb: record?.storageGb,
    privateIp: record?.privateIp ?? runtime.ipv4[0] ?? null,
    publicIp: record?.publicIp,
    availabilityZone: record?.availabilityZone,
    createdAt: record?.createdAt?.toISOString()
  };
}

function runtimeUpdate(runtime: MultipassInstance): Prisma.ComputeInstanceUncheckedUpdateInput {
  return {
    status: runtimeStatus(runtime.state),
    powerState: runtime.state,
    operatingSystem: runtime.release ?? "Ubuntu",
    imageRef: runtime.imageHash ?? runtime.release ?? "24.04",
    privateIp: runtime.ipv4[0] ?? null,
    lastSyncedAt: new Date(),
    metadata: {
      ipv4: runtime.ipv4,
      load: runtime.load ?? [],
      diskUsage: runtime.diskUsage ?? null,
      memoryUsage: runtime.memoryUsage ?? null,
      mountCount: runtime.mountCount ?? 0
    }
  };
}

export async function recordLaunchedInstance({ user, launch, runtime }: LaunchRecordInput) {
  const now = new Date();
  const privateIp = runtime?.ipv4[0] ?? null;

  try {
    return await prisma.computeInstance.upsert({
      where: { multipassName: launch.name },
      update: {
        ...runtimeUpdate(runtime ?? {
          name: launch.name,
          state: "Running",
          ipv4: privateIp ? [privateIp] : [],
          release: launch.image ?? "Ubuntu",
          imageHash: launch.image
        }),
        cpu: launch.cpus ?? Number(process.env.MULTIPASS_DEFAULT_CPUS ?? 1),
        ramMb: memoryToMb(launch.memory),
        storageGb: diskToGb(launch.disk),
        launchedAt: now,
        terminatedAt: null,
        ...ownerFields(user)
      },
      create: {
        instanceId: createCloudResourceId("instance"),
        multipassName: launch.name,
        name: launch.name,
        status: runtime ? runtimeStatus(runtime.state) : "RUNNING",
        powerState: runtime?.state ?? "Running",
        operatingSystem: runtime?.release ?? "Ubuntu",
        imageRef: launch.image ?? runtime?.imageHash ?? process.env.MULTIPASS_DEFAULT_IMAGE ?? "24.04",
        cpu: launch.cpus ?? Number(process.env.MULTIPASS_DEFAULT_CPUS ?? 1),
        ramMb: memoryToMb(launch.memory),
        storageGb: diskToGb(launch.disk),
        privateIp,
        availabilityZone: "local",
        launchedAt: now,
        lastSyncedAt: now,
        metadata: {
          source: "multipass",
          ipv4: runtime?.ipv4 ?? [],
          diskUsage: runtime?.diskUsage ?? launch.disk ?? null,
          memoryUsage: runtime?.memoryUsage ?? launch.memory ?? null
        },
        ...ownerFields(user)
      }
    });
  } catch {
    return null;
  }
}

export async function syncRuntimeInstances(user: AppSessionUser, instances: MultipassInstance[]) {
  try {
    const records = await Promise.all(
      instances.map((instance) =>
        prisma.computeInstance.upsert({
          where: { multipassName: instance.name },
          update: runtimeUpdate(instance),
          create: {
            instanceId: createCloudResourceId("instance"),
            multipassName: instance.name,
            name: instance.name,
            status: runtimeStatus(instance.state),
            powerState: instance.state,
            operatingSystem: instance.release ?? "Ubuntu",
            imageRef: instance.imageHash ?? instance.release ?? "24.04",
            cpu: Number(process.env.MULTIPASS_DEFAULT_CPUS ?? 1),
            ramMb: memoryToMb(),
            storageGb: diskToGb(),
            privateIp: instance.ipv4[0] ?? null,
            availabilityZone: "local",
            lastSyncedAt: new Date(),
            metadata: {
              source: "multipass-sync",
              ipv4: instance.ipv4,
              load: instance.load ?? []
            },
            ...ownerFields(user)
          }
        })
      )
    );

    return instances.map((instance) => {
      const record = records.find((item) => item.multipassName === instance.name) ?? null;
      return instanceApiShape(record, instance);
    });
  } catch {
    return instances.map((instance) => instanceApiShape(null, instance));
  }
}

export async function recordInstanceAction({ name, runtime, fallbackStatus }: ActionRecordInput) {
  try {
    const status = runtime ? runtimeStatus(runtime.state) : fallbackStatus;

    return await prisma.computeInstance.updateMany({
      where: { OR: [{ multipassName: name }, { name }] },
      data: {
        ...(runtime ? runtimeUpdate(runtime) : {}),
        ...(status ? { status } : {}),
        ...(status === "STOPPED" ? { stoppedAt: new Date() } : {}),
        ...(status === "TERMINATED" ? { terminatedAt: new Date() } : {})
      }
    });
  } catch {
    return null;
  }
}

export async function markInstanceTerminated(name: string) {
  return recordInstanceAction({ name, runtime: null, fallbackStatus: "TERMINATED" });
}

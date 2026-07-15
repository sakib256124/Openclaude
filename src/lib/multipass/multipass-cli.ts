import "server-only";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { OpenCloudError } from "@/lib/multipass/errors";
import type { MultipassAction, MultipassHealth, MultipassInstance, MultipassLaunchInput } from "@/lib/multipass/types";

const execFileAsync = promisify(execFile);

function multipassBin() {
  return process.env.MULTIPASS_BIN?.trim() || "multipass";
}

function requestTimeoutMs() {
  return Number(process.env.MULTIPASS_REQUEST_TIMEOUT_MS ?? 30_000);
}

async function runMultipassCommand(args: string[], timeoutMs = requestTimeoutMs()) {
  try {
    const result = await execFileAsync(multipassBin(), args, {
      timeout: timeoutMs,
      windowsHide: true,
      maxBuffer: 1024 * 1024 * 8
    });

    return result.stdout.trim();
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException & { stderr?: string; stdout?: string };
    const message = nodeError.code === "ENOENT"
      ? "Multipass CLI was not found. Install Multipass on Ubuntu with: sudo snap install multipass."
      : (nodeError.stderr || nodeError.stdout || nodeError.message || "Multipass command failed.").trim();

    throw new OpenCloudError(
      nodeError.code === "ENOENT" ? "SERVICE_UNAVAILABLE" : "COMMAND_FAILED",
      message,
      nodeError.code === "ENOENT" ? 503 : 500
    );
  }
}

function parseJson<T>(raw: string, fallback: T): T {
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new OpenCloudError("MULTIPASS_ERROR", "Multipass returned invalid JSON.", 502);
  }
}

function normalizeListItem(item: {
  name?: string;
  state?: string;
  ipv4?: string[] | string;
  release?: string;
  image_hash?: string;
}): MultipassInstance {
  return {
    name: item.name ?? "unknown",
    state: (item.state ?? "Unknown") as MultipassInstance["state"],
    ipv4: Array.isArray(item.ipv4) ? item.ipv4 : item.ipv4 ? [item.ipv4] : [],
    release: item.release,
    imageHash: item.image_hash
  };
}

export async function getMultipassHealth(): Promise<MultipassHealth> {
  try {
    const version = await runMultipassCommand(["version"], 10_000);

    return {
      configured: true,
      status: "healthy",
      binary: multipassBin(),
      version: version.split("\n")[0] || null,
      message: "Multipass CLI is available."
    };
  } catch (error) {
    if (error instanceof OpenCloudError) {
      return {
        configured: false,
        status: "unavailable",
        binary: multipassBin(),
        version: null,
        message: error.message
      };
    }

    throw error;
  }
}

export async function listMultipassInstances(): Promise<MultipassInstance[]> {
  const raw = await runMultipassCommand(["list", "--format", "json"]);
  const parsed = parseJson<{ list?: Array<Parameters<typeof normalizeListItem>[0]> }>(raw, { list: [] });

  return (parsed.list ?? []).map(normalizeListItem);
}

export async function getMultipassInstance(name: string): Promise<MultipassInstance | null> {
  const raw = await runMultipassCommand(["info", name, "--format", "json"]);
  const parsed = parseJson<{
    info?: Record<string, {
      state?: string;
      ipv4?: string[] | string;
      release?: string;
      image_hash?: string;
      load?: string[];
      disk_usage?: string;
      memory_usage?: string;
      mounts?: Record<string, unknown>;
    }>;
  }>(raw, { info: {} });
  const details = parsed.info?.[name];

  if (!details) {
    return null;
  }

  return {
    ...normalizeListItem({ name, ...details }),
    load: details.load,
    diskUsage: details.disk_usage,
    memoryUsage: details.memory_usage,
    mountCount: details.mounts ? Object.keys(details.mounts).length : 0
  };
}

export async function launchMultipassInstance(input: MultipassLaunchInput) {
  const args = ["launch", input.image || process.env.MULTIPASS_DEFAULT_IMAGE || "24.04", "--name", input.name];

  if (input.cpus) {
    args.push("--cpus", String(input.cpus));
  }

  if (input.memory) {
    args.push("--memory", input.memory);
  }

  if (input.disk) {
    args.push("--disk", input.disk);
  }

  if (input.cloudInit) {
    args.push("--cloud-init", input.cloudInit);
  }

  await runMultipassCommand(args, Number(process.env.MULTIPASS_LAUNCH_TIMEOUT_MS ?? 180_000));
  return getMultipassInstance(input.name);
}

export async function runMultipassInstanceAction(name: string, action: MultipassAction) {
  await runMultipassCommand([action, name], action === "restart" ? 90_000 : requestTimeoutMs());
  return getMultipassInstance(name);
}

export async function deleteMultipassInstance(name: string) {
  await runMultipassCommand(["delete", name, "--purge"]);
}

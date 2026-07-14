import "server-only";
import { OpenCloudError } from "@/lib/multipass/errors";
import type { MultipassHostConfig } from "@/lib/multipass/types";

export function resolveMultipassHost(input: Partial<MultipassHostConfig>) {
  if (!input.host) {
    throw new OpenCloudError("MISSING_HOST", "No Multipass host was configured.", 503);
  }

  return {
    host: input.host,
    driver: input.driver ?? "qemu",
    socketPath: input.socketPath,
    requestTimeoutMs: input.requestTimeoutMs ?? 30_000
  } satisfies MultipassHostConfig;
}

export function buildMultipassCommand(args: string[]) {
  return ["multipass", ...args].join(" ");
}

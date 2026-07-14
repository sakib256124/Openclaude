import { describe, expect, it } from "vitest";
import { buildMultipassCommand, resolveMultipassHost } from "../../src/lib/multipass/commands";
import { OpenCloudError, toSafeErrorResponse } from "../../src/lib/multipass/errors";

describe("Multipass foundation helpers", () => {
  it("resolves a Multipass host configuration", () => {
    const host = resolveMultipassHost({
      host: "ubuntu-lab",
      driver: "qemu",
      requestTimeoutMs: 20_000
    });

    expect(host).toEqual({
      host: "ubuntu-lab",
      driver: "qemu",
      socketPath: undefined,
      requestTimeoutMs: 20_000
    });
  });

  it("builds a Multipass command safely from explicit arguments", () => {
    expect(buildMultipassCommand(["list", "--format", "json"])).toBe("multipass list --format json");
  });

  it("returns safe error responses without leaking internals", () => {
    const response = toSafeErrorResponse(
      new OpenCloudError("MISSING_HOST", "No Multipass host was configured.", 503, "req-123")
    );

    expect(response).toEqual({
      code: "MISSING_HOST",
      message: "No Multipass host was configured.",
      requestId: "req-123"
    });
  });
});

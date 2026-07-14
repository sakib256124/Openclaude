import { describe, expect, it } from "vitest";
import { OpenCloudError, toSafeErrorResponse } from "../../src/lib/openstack/errors";
import { resolveEndpoint } from "../../src/lib/openstack/service-catalog";

describe("OpenStack foundation helpers", () => {
  it("resolves a service endpoint by type, region, and interface", () => {
    const endpoint = resolveEndpoint({
      serviceType: "compute",
      region: "RegionOne",
      endpointInterface: "public",
      catalog: [
        {
          id: "svc-1",
          name: "nova",
          type: "compute",
          endpoints: [
            {
              id: "endpoint-1",
              region: "RegionOne",
              interface: "public",
              url: "https://openstack.example.com/compute/"
            }
          ]
        }
      ]
    });

    expect(endpoint).toBe("https://openstack.example.com/compute");
  });

  it("returns safe error responses without leaking internals", () => {
    const response = toSafeErrorResponse(
      new OpenCloudError("MISSING_ENDPOINT", "No compute endpoint was found.", 503, "req-123")
    );

    expect(response).toEqual({
      code: "MISSING_ENDPOINT",
      message: "No compute endpoint was found.",
      requestId: "req-123"
    });
  });
});

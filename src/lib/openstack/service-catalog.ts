import "server-only";
import { OpenCloudError } from "@/lib/openstack/errors";
import type { OpenStackEndpointInterface, OpenStackServiceType, ServiceCatalogEntry } from "@/lib/openstack/types";

export function resolveEndpoint(input: {
  catalog: ServiceCatalogEntry[];
  serviceType: OpenStackServiceType;
  region: string;
  endpointInterface: OpenStackEndpointInterface;
}) {
  const service = input.catalog.find((entry) => entry.type === input.serviceType);
  const endpoint = service?.endpoints.find(
    (item) => item.interface === input.endpointInterface && (!item.region || item.region === input.region)
  );

  if (!endpoint) {
    throw new OpenCloudError(
      "MISSING_ENDPOINT",
      `No ${input.endpointInterface} endpoint was found for ${input.serviceType} in ${input.region}.`,
      503
    );
  }

  return endpoint.url.replace(/\/$/, "");
}

export type OpenStackServiceType =
  | "identity"
  | "compute"
  | "image"
  | "network"
  | "volumev3"
  | "metric"
  | "metering";

export type OpenStackEndpointInterface = "public" | "internal" | "admin";

export type OpenStackConnectionConfig = {
  authUrl: string;
  region: string;
  endpointInterface: OpenStackEndpointInterface;
  applicationCredentialId: string;
  applicationCredentialSecret: string;
  projectId?: string;
};

export type OpenStackToken = {
  id: string;
  expiresAt: Date;
  catalog: ServiceCatalogEntry[];
};

export type ServiceCatalogEntry = {
  id: string;
  name: string;
  type: OpenStackServiceType | string;
  endpoints: ServiceCatalogEndpoint[];
};

export type ServiceCatalogEndpoint = {
  id: string;
  region?: string;
  interface: OpenStackEndpointInterface | string;
  url: string;
};

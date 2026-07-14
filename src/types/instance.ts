export type InstanceStatus = "ACTIVE" | "SHUTOFF" | "BUILD" | "ERROR" | "PAUSED" | "SUSPENDED" | "UNKNOWN";

export type InstanceSummary = {
  id: string;
  name: string;
  status: InstanceStatus;
  imageName?: string;
  flavorName?: string;
  privateIps: string[];
  floatingIps: string[];
  availabilityZone?: string;
  createdAt: string;
};

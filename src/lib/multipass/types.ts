export type MultipassDriver = "qemu" | "lxd" | "hyperv" | "virtualbox";

export type MultipassHostConfig = {
  host: string;
  driver: MultipassDriver;
  socketPath?: string;
  requestTimeoutMs: number;
};

export type MultipassInstanceState = "Running" | "Stopped" | "Suspended" | "Starting" | "Deleted" | "Unknown";

export type MultipassInstance = {
  name: string;
  state: MultipassInstanceState;
  ipv4: string[];
  release?: string;
  imageHash?: string;
  load?: string[];
  diskUsage?: string;
  memoryUsage?: string;
  mountCount?: number;
};

export type MultipassLaunchInput = {
  name: string;
  image?: string;
  cpus?: number;
  memory?: string;
  disk?: string;
  cloudInit?: string;
};

export type MultipassAction = "start" | "stop" | "restart" | "suspend";

export type MultipassHealth = {
  configured: boolean;
  status: "healthy" | "unavailable";
  binary: string;
  version: string | null;
  message: string;
};

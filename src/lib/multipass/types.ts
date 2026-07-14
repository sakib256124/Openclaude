export type MultipassDriver = "qemu" | "lxd" | "hyperv" | "virtualbox";

export type MultipassHostConfig = {
  host: string;
  driver: MultipassDriver;
  socketPath?: string;
  requestTimeoutMs: number;
};

export type MultipassInstanceState = "Running" | "Stopped" | "Suspended" | "Deleted" | "Unknown";

export type MultipassInstance = {
  name: string;
  state: MultipassInstanceState;
  ipv4: string[];
  release?: string;
  imageHash?: string;
};

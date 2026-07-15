import "server-only";
import { demoRecentInstances } from "@/lib/demo-data";
import type { MultipassInstance, MultipassLaunchInput } from "@/lib/multipass/types";

type DemoStore = {
  instances: MultipassInstance[];
};

const globalDemoStore = globalThis as typeof globalThis & {
  __opencloudMultipassDemoStore?: DemoStore;
};

function initialInstances(): MultipassInstance[] {
  return demoRecentInstances.map((instance) => ({
    name: instance.name,
    state: instance.status === "ACTIVE" ? "Running" : instance.status === "SHUTOFF" ? "Stopped" : "Starting",
    ipv4: [instance.privateIp],
    release: "Ubuntu 24.04 LTS"
  }));
}

function getStore() {
  if (!globalDemoStore.__opencloudMultipassDemoStore) {
    globalDemoStore.__opencloudMultipassDemoStore = {
      instances: initialInstances()
    };
  }

  return globalDemoStore.__opencloudMultipassDemoStore;
}

export function listDemoInstances() {
  return getStore().instances;
}

export function createDemoInstance(input: MultipassLaunchInput) {
  const store = getStore();
  const existingIndex = store.instances.findIndex((instance) => instance.name === input.name);
  const instance: MultipassInstance = {
    name: input.name,
    state: "Running",
    ipv4: [`10.10.9.${20 + (store.instances.length % 180)}`],
    release: input.image === "debian" ? "Debian" : "Ubuntu 24.04 LTS",
    imageHash: input.image ?? "24.04",
    diskUsage: input.disk ?? "10G",
    memoryUsage: input.memory ?? "2G"
  };

  if (existingIndex >= 0) {
    store.instances[existingIndex] = instance;
  } else {
    store.instances.unshift(instance);
  }

  return instance;
}

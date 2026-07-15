import "server-only";
import type { MultipassAction, MultipassInstance, MultipassLaunchInput } from "@/lib/multipass/types";

type LocalStore = {
  instances: MultipassInstance[];
};

const globalLocalStore = globalThis as typeof globalThis & {
  __opencloudMultipassLocalStore?: LocalStore;
};

function initialInstances(): MultipassInstance[] {
  return [];
}

function getStore() {
  if (!globalLocalStore.__opencloudMultipassLocalStore) {
    globalLocalStore.__opencloudMultipassLocalStore = {
      instances: initialInstances()
    };
  }

  return globalLocalStore.__opencloudMultipassLocalStore;
}

export function listLocalInstances() {
  return getStore().instances;
}

export function createLocalInstance(input: MultipassLaunchInput) {
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

export function deleteLocalInstance(name: string) {
  const store = getStore();
  const before = store.instances.length;
  store.instances = store.instances.filter((instance) => instance.name !== name);
  return store.instances.length !== before;
}

export function runLocalInstanceAction(name: string, action: MultipassAction) {
  const store = getStore();
  const instance = store.instances.find((item) => item.name === name);

  if (!instance) {
    return null;
  }

  if (action === "stop") {
    instance.state = "Stopped";
  } else if (action === "suspend") {
    instance.state = "Suspended";
  } else {
    instance.state = "Running";
  }

  return instance;
}

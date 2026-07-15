export const multipassImageCatalog = [
  { alias: "24.04", name: "Ubuntu 24.04 LTS", release: "Noble Numbat", default: true },
  { alias: "22.04", name: "Ubuntu 22.04 LTS", release: "Jammy Jellyfish", default: false },
  { alias: "20.04", name: "Ubuntu 20.04 LTS", release: "Focal Fossa", default: false },
  { alias: "debian", name: "Debian", release: "Current cloud image", default: false }
];

export const multipassFlavorCatalog = [
  { name: "micro", cpus: 1, memory: "1G", disk: "5G", description: "Small demo VM" },
  { name: "small", cpus: 1, memory: "2G", disk: "10G", description: "Default classroom VM" },
  { name: "medium", cpus: 2, memory: "4G", disk: "20G", description: "Application test VM" },
  { name: "large", cpus: 4, memory: "8G", disk: "40G", description: "Heavier lab workload" }
];

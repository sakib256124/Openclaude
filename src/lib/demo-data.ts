export const demoDashboardMetrics = [
  { title: "Total Instances", value: "12", helper: "8 running, 3 stopped, 1 building" },
  { title: "Running", value: "8", helper: "Healthy compute workloads" },
  { title: "Stopped", value: "3", helper: "Paused for cost control" },
  { title: "Error", value: "1", helper: "Requires operator review" },
  { title: "Allocated vCPUs", value: "48", helper: "Across active demo flavors" },
  { title: "Allocated RAM", value: "192 GB", helper: "Current reserved memory" },
  { title: "Volume Storage", value: "1.8 TB", helper: "Attached and available volumes" },
  { title: "Floating IPs", value: "7", helper: "5 associated, 2 reserved" }
];

export const demoQuotaUsage = [
  { label: "Instances", used: 12, limit: 24 },
  { label: "vCPUs", used: 48, limit: 96 },
  { label: "RAM", used: 192, limit: 384 },
  { label: "Floating IPs", used: 7, limit: 16 },
  { label: "Volumes", used: 18, limit: 40 },
  { label: "Volume storage", used: 1840, limit: 4096 }
];

export const demoRecentInstances = [
  { name: "web-prod-01", status: "ACTIVE", flavor: "m1.medium", privateIp: "10.10.1.21", az: "nova-a" },
  { name: "api-prod-02", status: "ACTIVE", flavor: "c2.large", privateIp: "10.10.1.34", az: "nova-a" },
  { name: "worker-batch-01", status: "SHUTOFF", flavor: "m1.small", privateIp: "10.10.2.18", az: "nova-b" },
  { name: "db-replica-01", status: "BUILD", flavor: "r2.large", privateIp: "10.10.3.12", az: "nova-c" }
];

export const demoServiceHealth = [
  { service: "Keystone", status: "SUCCESS", endpoint: "Identity v3", latency: "42 ms" },
  { service: "Nova", status: "SUCCESS", endpoint: "Compute v2.1", latency: "86 ms" },
  { service: "Glance", status: "SUCCESS", endpoint: "Image v2", latency: "59 ms" },
  { service: "Neutron", status: "SUCCESS", endpoint: "Network v2", latency: "91 ms" },
  { service: "Cinder", status: "SUCCESS", endpoint: "Block Storage v3", latency: "73 ms" },
  { service: "Telemetry", status: "PAUSED", endpoint: "Gnocchi optional", latency: "Not enabled" }
];

export const demoImages = [
  ["ubuntu-24.04-server", "Ubuntu 24.04 LTS", "ACTIVE", "22.4 GB", "2026-07-10"],
  ["debian-12-cloud", "Debian 12", "ACTIVE", "12.8 GB", "2026-07-08"],
  ["rocky-9-minimal", "Rocky Linux 9", "ACTIVE", "9.6 GB", "2026-07-03"],
  ["windows-server-2022", "Windows Server 2022", "ACTIVE", "48.0 GB", "2026-06-28"]
];

export const demoKeyPairs = [
  ["opencloud-admin-key", "ssh-rsa", "SHA256:Z4p2...9xK", "2026-07-12"],
  ["web-tier-key", "ssh-ed25519", "SHA256:M8d1...2qL", "2026-07-08"],
  ["ops-maintenance-key", "ssh-rsa", "SHA256:P7v5...6nR", "2026-06-30"]
];

export const demoNetworks = [
  ["private-app-net", "10.10.1.0/24", "UP", "8 ports", "router-main"],
  ["database-net", "10.10.3.0/24", "UP", "5 ports", "router-main"],
  ["public-provider-net", "203.0.113.0/24", "UP", "7 floating IPs", "external"]
];

export const demoSecurityGroups = [
  ["web-sg", "HTTP, HTTPS, SSH", "6 rules", "4 instances"],
  ["database-sg", "PostgreSQL internal only", "3 rules", "2 instances"],
  ["admin-access-sg", "SSH from office VPN", "2 rules", "3 instances"]
];

export const demoVolumes = [
  ["db-primary-data", "500 GB", "in-use", "db-primary-01", "ssd"],
  ["media-assets", "750 GB", "available", "-", "standard"],
  ["backup-weekly-01", "300 GB", "available", "-", "standard"],
  ["api-logs", "290 GB", "in-use", "api-prod-02", "standard"]
];

export const demoFloatingIps = [
  ["203.0.113.21", "web-prod-01", "10.10.1.21", "ACTIVE"],
  ["203.0.113.34", "api-prod-02", "10.10.1.34", "ACTIVE"],
  ["203.0.113.45", "-", "-", "RESERVED"],
  ["203.0.113.52", "vpn-gateway-01", "10.10.0.10", "ACTIVE"]
];

export const demoBilling = [
  ["Compute", "$128.40", "12 instances", "Current month estimate"],
  ["Block Storage", "$184.00", "1.8 TB", "SSD and standard volumes"],
  ["Floating IP", "$20.16", "7 IPs", "Hourly reservation estimate"],
  ["Total Estimate", "$332.56", "July 2026", "Local estimate only"]
];

export const demoInstanceSnapshots = [
  ["web-prod-01-pre-release", "web-prod-01", "ACTIVE", "22.6 GB", "2026-07-13"],
  ["api-prod-02-before-patch", "api-prod-02", "ACTIVE", "18.1 GB", "2026-07-11"],
  ["worker-batch-template", "worker-batch-01", "SAVED", "10.4 GB", "2026-07-02"]
];

export const demoVolumeSnapshots = [
  ["db-primary-nightly", "db-primary-data", "available", "500 GB", "2026-07-14"],
  ["media-assets-weekly", "media-assets", "available", "750 GB", "2026-07-12"],
  ["api-logs-before-rotate", "api-logs", "available", "290 GB", "2026-07-10"]
];

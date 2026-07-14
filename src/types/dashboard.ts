export type DashboardSummary = {
  totalInstances: number;
  runningInstances: number;
  stoppedInstances: number;
  errorInstances: number;
  allocatedVcpus: number;
  allocatedRamGb: number;
  allocatedStorageGb: number;
  floatingIpCount: number;
  volumeCount: number;
  estimatedCost: string;
  lastSuccessfulRefreshAt: string | null;
};

"use client";

import { useQuery } from "@tanstack/react-query";

export function useInstanceMetrics(instanceId: string) {
  return useQuery({
    queryKey: ["instance-metrics", instanceId],
    queryFn: async () => {
      const response = await fetch(`/api/metrics?instanceId=${encodeURIComponent(instanceId)}`);
      return response.json();
    },
    enabled: instanceId.length > 0,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false
  });
}

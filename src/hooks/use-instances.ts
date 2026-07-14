"use client";

import { useQuery } from "@tanstack/react-query";

export function useInstances() {
  return useQuery({
    queryKey: ["instances"],
    queryFn: async () => {
      const response = await fetch("/api/instances");
      return response.json();
    },
    refetchInterval: 10_000,
    refetchIntervalInBackground: false
  });
}

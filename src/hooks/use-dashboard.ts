"use client";

import { useQuery } from "@tanstack/react-query";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard");
      return response.json();
    },
    refetchInterval: 15_000,
    refetchIntervalInBackground: false
  });
}

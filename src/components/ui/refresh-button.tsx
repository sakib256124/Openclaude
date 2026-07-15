"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function RefreshButton({ onRefresh, disabled }: { onRefresh?: () => void; disabled?: boolean }) {
  const router = useRouter();

  return (
    <Button
      variant="secondary"
      onClick={() => {
        if (onRefresh) {
          onRefresh();
          return;
        }

        router.refresh();
      }}
      disabled={disabled}
    >
      <RefreshCw />
      Refresh
    </Button>
  );
}

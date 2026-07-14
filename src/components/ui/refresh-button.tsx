"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RefreshButton({ onRefresh, disabled }: { onRefresh?: () => void; disabled?: boolean }) {
  return (
    <Button variant="secondary" onClick={onRefresh} disabled={disabled}>
      <RefreshCw />
      Refresh
    </Button>
  );
}

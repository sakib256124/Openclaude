import type { ReactNode } from "react";

export function FilterBar({ left, right }: { left?: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap gap-3">{left}</div>
      {right ? <div className="flex shrink-0 flex-wrap gap-2">{right}</div> : null}
    </div>
  );
}

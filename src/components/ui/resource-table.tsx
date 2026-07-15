import type { ReactNode } from "react";
import { ArrowUpDown } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

export type ResourceColumn = {
  key: string;
  label: string;
  className?: string;
  sortable?: boolean;
};

export function ResourceTable({
  columns,
  rows,
  loading,
  emptyTitle,
  emptyDescription,
  renderMobileCard,
  sortKey,
  sortDirection,
  onSort
}: {
  columns: ResourceColumn[];
  rows: ReactNode[][];
  loading?: boolean;
  emptyTitle: string;
  emptyDescription: string;
  renderMobileCard?: (rowIndex: number) => ReactNode;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (key: string) => void;
}) {
  if (loading) {
    return <LoadingSkeleton rows={5} />;
  }

  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <section className="overflow-hidden rounded-lg border bg-card">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-[13px] leading-5">
          <thead className="sticky top-0 z-10 bg-[var(--surface-elevated)] text-xs font-semibold uppercase leading-4 text-muted-foreground">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={cn("h-[42px] px-[14px] font-semibold", column.className)}>
                  {column.sortable ? (
                    <button
                      className="inline-flex items-center gap-1 text-left uppercase hover:text-foreground"
                      type="button"
                      onClick={() => onSort?.(column.key)}
                    >
                      {column.label}
                      <ArrowUpDown className={cn("h-3 w-3", sortKey === column.key ? "text-primary" : undefined)} />
                      {sortKey === column.key ? <span className="sr-only">Sorted {sortDirection}</span> : null}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1">{column.label}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="min-h-[54px] border-t transition hover:bg-[var(--surface-hover)]">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-[14px] py-3 align-middle">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {renderMobileCard ? <div className="grid gap-3 p-3 md:hidden">{rows.map((_, index) => renderMobileCard(index))}</div> : null}
      <Pagination />
    </section>
  );
}

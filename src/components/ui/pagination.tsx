import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Pagination({ page = 1, totalPages = 1 }: { page?: number; totalPages?: number }) {
  return (
    <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
      <span>
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" disabled>
          <ChevronLeft />
          Previous
        </Button>
        <Button variant="secondary" size="sm" disabled>
          Next
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}

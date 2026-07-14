import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({
  title,
  description,
  onRetry
}: {
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-5">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
        <div>
          <h2 className="text-sm font-semibold leading-5 text-foreground">{title}</h2>
          <p className="mt-1 text-sm leading-[21px] text-muted-foreground">{description}</p>
          {onRetry ? (
            <Button className="mt-4" variant="secondary" size="sm" onClick={onRetry}>
              Retry
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function LastUpdated({ value }: { value?: Date | string | null }) {
  return (
    <span className="text-xs leading-[18px] text-muted-foreground">
      Last successful refresh: {value ? new Date(value).toLocaleString() : "Never"}
    </span>
  );
}

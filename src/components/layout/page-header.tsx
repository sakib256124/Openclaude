import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
  eyebrow
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-2">
        {eyebrow ? <p className="text-xs font-semibold uppercase leading-[18px] text-primary">{eyebrow}</p> : null}
        <h1 className="text-2xl font-semibold leading-8 tracking-normal text-foreground sm:text-[28px] sm:leading-9">
          {title}
        </h1>
        {description ? <p className="max-w-3xl text-sm leading-[21px] text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

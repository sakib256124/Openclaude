"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

function titleCase(segment: string) {
  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav className="flex items-center gap-1 text-sm leading-5 text-muted-foreground" aria-label="Breadcrumb">
      <Link className="transition hover:text-foreground" href="/dashboard">
        OpenCloud
      </Link>
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;

        return (
          <span key={href} className="flex items-center gap-1">
            <ChevronRight className="h-4 w-4" />
            {isLast ? (
              <span className="font-medium text-foreground">{titleCase(segment)}</span>
            ) : (
              <Link className="transition hover:text-foreground" href={href}>
                {titleCase(segment)}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

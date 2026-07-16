"use client";

import Link from "next/link";
import { Camera, Globe2, HardDrive, Images, KeyRound, Loader2, Network, Search, Server, Shield } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SearchResult = {
  id: string;
  label: string;
  subtitle: string;
  resourceType: string;
  status?: string | null;
  href: string;
};

const iconByType = {
  Instance: Server,
  Image: Images,
  "Key pair": KeyRound,
  Network,
  "Security group": Shield,
  Address: Globe2,
  Volume: HardDrive,
  Snapshot: Camera
};

function resultIcon(type: string) {
  return iconByType[type as keyof typeof iconByType] ?? Search;
}

export function GlobalSearch() {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  React.useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=24`, {
          signal: controller.signal
        });

        if (!response.ok) {
          setResults([]);
          return;
        }

        const payload = await response.json() as { results?: SearchResult[] };
        setResults(payload.results ?? []);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return (
    <div ref={containerRef} className="relative hidden w-[min(34vw,440px)] min-w-[260px] lg:block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        className="h-9 w-full rounded-md border bg-[var(--surface)] pl-9 pr-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search resources"
        aria-label="Search resources"
      />

      {open && query.trim().length >= 2 ? (
        <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-md border bg-[var(--surface-elevated)] shadow-xl shadow-black/30">
          <div className="max-h-[420px] overflow-y-auto p-1">
            {loading ? (
              <div className="flex h-20 items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching
              </div>
            ) : results.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">No matching resources</div>
            ) : (
              results.map((result) => {
                const Icon = resultIcon(result.resourceType);

                return (
                  <Link
                    key={`${result.resourceType}-${result.id}`}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition hover:bg-[var(--surface-hover)]"
                    href={result.href}
                    onClick={() => setOpen(false)}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate font-medium text-foreground">{result.label}</span>
                        <Badge className="shrink-0">{result.resourceType}</Badge>
                      </span>
                      <span className="block truncate text-xs leading-5 text-muted-foreground">{result.subtitle}</span>
                    </span>
                    {result.status ? (
                      <span className={cn("shrink-0 text-xs font-semibold text-muted-foreground", result.status === "RUNNING" && "text-primary")}>
                        {result.status}
                      </span>
                    ) : null}
                  </Link>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

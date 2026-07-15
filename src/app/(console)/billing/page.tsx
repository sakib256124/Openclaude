"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ResourceTable } from "@/components/ui/resource-table";

const columns = [
  { key: "service", label: "Service", sortable: true },
  { key: "cost", label: "Estimated cost" },
  { key: "usage", label: "Usage" },
  { key: "note", label: "Note" }
];

export default function BillingPage() {
  const [rows, setRows] = React.useState<Array<{ service: string; estimatedCost: number; usage: string; note: string }>>([]);
  const [currency, setCurrency] = React.useState("USD");
  const [total, setTotal] = React.useState(0);

  React.useEffect(() => {
    fetch("/api/billing", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : { rows: [], currency: "USD", total: 0 })
      .then((data) => {
        setRows(Array.isArray(data.rows) ? data.rows : []);
        setCurrency(data.currency ?? "USD");
        setTotal(Number(data.total ?? 0));
      })
      .catch(() => {
        setRows([]);
        setCurrency("USD");
        setTotal(0);
      });
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Billing" description={`Estimated total: ${currency} ${total.toFixed(4)}`} />
      <ResourceTable
        columns={columns}
        rows={rows.map((row) => [
          row.service,
          `${currency} ${row.estimatedCost.toFixed(4)}`,
          row.usage,
          row.note
        ])}
        emptyTitle="No billing rows"
        emptyDescription="Create resources to calculate billing rows."
      />
    </div>
  );
}

"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResourceTable, type ResourceColumn } from "@/components/ui/resource-table";
import { StatusBadge } from "@/components/ui/status-badge";

type Field = {
  key: string;
  label: string;
  defaultValue?: string;
  type?: "text" | "number";
};

type LocalRow = Record<string, string>;

export function LocalResourceManager({
  storageKey,
  title,
  columns,
  fields,
  emptyTitle,
  emptyDescription,
  deleteLabel = "Delete"
}: {
  storageKey: string;
  title: string;
  columns: ResourceColumn[];
  fields: Field[];
  emptyTitle: string;
  emptyDescription: string;
  deleteLabel?: string;
}) {
  const [rows, setRows] = React.useState<LocalRow[]>([]);
  const [form, setForm] = React.useState<LocalRow>(() =>
    Object.fromEntries(fields.map((field) => [field.key, field.defaultValue ?? ""]))
  );

  React.useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    setRows(saved ? JSON.parse(saved) as LocalRow[] : []);
  }, [storageKey]);

  function persist(nextRows: LocalRow[]) {
    setRows(nextRows);
    window.localStorage.setItem(storageKey, JSON.stringify(nextRows));
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextRow = { ...form, id: crypto.randomUUID(), created: new Date().toISOString().slice(0, 10) };
    persist([nextRow, ...rows]);
  }

  function deleteRow(id: string) {
    persist(rows.filter((row) => row.id !== id));
  }

  const tableColumns = [...columns, { key: "actions", label: "Actions" }];
  const tableRows = rows.map((row) => [
    ...columns.map((column) => {
      const value = row[column.key] ?? "-";
      return column.key === "status" ? <StatusBadge key={`${row.id}-${column.key}`} status={value} /> : value;
    }),
    <Button key={`${row.id}-delete`} variant="destructive" size="sm" onClick={() => deleteRow(row.id)}>
      <Trash2 />
      {deleteLabel}
    </Button>
  ]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-3 xl:grid-cols-4" onSubmit={onSubmit}>
            {fields.map((field) => (
              <label key={field.key} className="space-y-2 text-sm font-medium">
                <span>{field.label}</span>
                <input
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  required={field.key === "name"}
                  type={field.type ?? "text"}
                  value={form[field.key] ?? ""}
                  onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
                />
              </label>
            ))}
            <div className="flex items-end">
              <Button className="w-full" type="submit">
                <Plus />
                Create
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <ResourceTable columns={tableColumns} rows={tableRows} emptyTitle={emptyTitle} emptyDescription={emptyDescription} />
    </div>
  );
}

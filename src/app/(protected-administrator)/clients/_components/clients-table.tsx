"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { clientsTable } from "@/db/schema";

import { ClientsFilters } from "./clients-filters";
import TableClientActions from "./table-actions";

type Client = typeof clientsTable.$inferSelect;

const clientsTableColumns: ColumnDef<Client>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Nome",
  },
  {
    id: "phoneNumber",
    accessorKey: "phoneNumber",
    header: "Contato",
    cell: ({ row }) => {
      const phone = row.getValue("phoneNumber") as string;
      if (!phone) return null;

      const formatted = phone.replace(
        /(\d{2})(\d{1})(\d{4})(\d{4})/,
        "($1) $2 $3-$4",
      );

      return formatted;
    },
  },
  {
    id: "actions",
    accessorKey: "actions",
    header: "Ações",
    cell: (params) => {
      const client = params.row.original;
      return <TableClientActions client={client} />;
    },
  },
];

interface ClientsTableProps {
  clients: Client[];
}

export function ClientsTable({ clients }: ClientsTableProps) {
  const [filters, setFilters] = useState({ name: "", phone: "" });

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const nameMatch =
        !filters.name ||
        client.name.toLowerCase().includes(filters.name.toLowerCase());

      const phoneMatch =
        !filters.phone ||
        client.phoneNumber?.includes(filters.phone.replace(/\D/g, ""));

      return nameMatch && phoneMatch;
    });
  }, [clients, filters]);

  const table = useReactTable({
    data: filteredClients,
    columns: clientsTableColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      <ClientsFilters onFilterChange={setFilters} />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={clientsTableColumns.length}
                  className="h-24 text-center"
                >
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

"use client"

import { ColumnDef } from "@tanstack/react-table"

import { productsTable } from "@/db/schema"

import TableProductActions from "./table-actions"

type Product = typeof productsTable.$inferSelect;

const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
        case "in_stock":
            return {
                label: "Em estoque",
                className: "bg-green-100 text-green-700 border-1 rounded-2xl p-1.5 text-xs",
            };
        case "out_of_stock":
            return {
                label: "Sem estoque",
                className: "bg-red-100 text-red-700 border-2 rounded-2xl p-1.5 text-xs",
            };
        default:
            return {
                label: status,
                className: "bg-gray-100 border-gray-500 text-gray-700 border-2 rounded-2xl p-1.5 text-xs",
            };
    }
};

export const productsTableColumns: ColumnDef<Product>[] = [
    {
        id: "name",
        accessorKey: "name",
        header: "Nome",
    },
    {
        id: "brand",
        accessorKey: "brand",
        header: "Marca",
    },
    {
        id: "category",
        accessorKey: "category",
        header: "Categoria",
    },
    {
        id: "price",
        accessorKey: "productPriceInCents",
        header: "Preço de custo",
        cell: ({ row }) => {
            const price = row.original.productPriceInCents / 100;
            return `R$ ${price.toFixed(2)}`;
        }
    },
    {
        id: "quantity_in_stock",
        accessorKey: "quantity_in_stock",
        header: "Quantidade em estoque",
    },
    {
        id: "stock_status",
        accessorKey: "stock_status",
        header: "Status do estoque",
        cell: ({ row }) => {
            const status = row.original.stock_status;
            if (!status) return null;

            const badge = getStatusBadge(status);
            return (
                <span className={badge.className}>
                    {badge.label}
                </span>
            );
        }
    },
    {
        id: "actions",
        cell: (params) => {
            const product = params.row.original;
            return (
                <TableProductActions product={product} />
            )
        }
    }
]
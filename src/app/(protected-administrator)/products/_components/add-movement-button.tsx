"use client"
import { ArrowLeftRight } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { productsTable } from "@/db/schema";

import UpsertMovementStockForm from "./upsert-movement-stock-form";

interface AddMovementStockButtonProps {
    products: (typeof productsTable.$inferSelect)[];
}

const AddMovementStockButton = ({ products }: AddMovementStockButtonProps) => {
    const [isOpen, setIsOpen] = useState(false);

    // Se não há produtos, não renderizar o botão
    if (products.length === 0) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="text-xs sm:text-sm">
                    <ArrowLeftRight className="h-4 w-4" />
                    <span className="hidden lg:inline">Adicionar movimento</span>
                </Button>
            </DialogTrigger>
            <UpsertMovementStockForm products={products} onSuccess={() => setIsOpen(false)} />
        </Dialog>
    );
}

export default AddMovementStockButton;
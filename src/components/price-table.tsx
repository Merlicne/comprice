"use client";

import { useCallback } from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type Item } from "@/model/item";
import { TableRowInput } from "./table-row-input";
import { usePriceComparison } from "@/hooks/use-price-comparison";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PriceTable({
    data,
    setData,
    onSortToggle,
    isSorted
}: {
    data: Item[];
    setData: (data: Item[]) => void;
    onSortToggle: () => void;
    isSorted: boolean;
}) {
    const { bestValueIndices, getNormalizedPrice } = usePriceComparison(data);

    // Handle input changes for any item
    const handleInputChange = useCallback((
        index: number,
        field: keyof Item,
        value: string | number
    ) => {
        const item = data[index];
        if (item) {
            const updatedItem = {
                ...item,
                [field]: field === 'unit' || field === 'name' ? value : Number(value)
            };
            // Note: If sorted, index might not match the original array structure if passed directly.
            // But since we are mapping over `data` which is passed from parent, 
            // the index corresponds to the item in the `data` array used to render.
            // If the parent passes sorted data, then we are updating sorted data.
            // But usually, state should be Single Source of Truth.
            // Let's assume `data` passed here is the array we want to modify by index.

            const newData = [...data];
            newData[index] = updatedItem;
            setData(newData);
        }
    }, [data, setData]);

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center w-full h-full p-8 text-slate-500">
                <div className="text-center">
                    <p className="mb-4">No items added yet</p>
                    <p className="text-sm">Click the "Add" button below to start comparing prices</p>
                </div>
            </div>
        );
    }

    return (

        <div className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden transition-all hover:shadow-md">
            <Table>
                <TableHeader className="hidden sm:table-header-group bg-slate-50/50 dark:bg-slate-900/50">
                    <TableRow className="border-b border-slate-100 dark:border-slate-800">
                        <TableHead className="w-[35%] min-w-[140px] pl-4">Name</TableHead>
                        <TableHead className="w-[20%] min-w-[100px]">Price</TableHead>
                        <TableHead className="w-[25%] min-w-[150px]">Volume / Unit</TableHead>
                        <TableHead className="w-[20%] text-right pr-4">
                            <Button
                                variant="ghost"
                                onClick={onSortToggle}
                                className="h-8 px-2 font-semibold text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 data-[sorted=true]:text-emerald-600"
                                data-sorted={isSorted}
                            >
                                Value
                                <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                            </Button>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item, index) => (
                        <TableRowInput
                            key={`${index}-${item.name}`}
                            item={item}
                            index={index}
                            onInputChange={handleInputChange}
                            isMinimumRatio={bestValueIndices.has(index)}
                            normalizedPrice={getNormalizedPrice(item)}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

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
        <div className="w-full overflow-x-auto border rounded-lg shadow-sm border-slate-200">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-100 dark:bg-slate-800">
                        <TableHead className="whitespace-nowrap w-[30%]">Name</TableHead>
                        <TableHead className="whitespace-nowrap w-[20%]">Price</TableHead>
                        <TableHead className="whitespace-nowrap w-[30%]">Volume / Unit</TableHead>
                        <TableHead className="text-right whitespace-nowrap w-[20%]">
                            <Button
                                variant="ghost"
                                onClick={onSortToggle}
                                className="flex items-center gap-1 ml-auto font-bold h-8 px-2"
                            >
                                Value
                                <ArrowUpDown className={`h-3 w-3 ${isSorted ? "text-emerald-500" : ""}`} />
                            </Button>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item, index) => (
                        <TableRowInput
                            key={`${index}-${item.name}`} // Use index in key to ensure stability when modifying
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

"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Separator } from "@/components/ui/separator"
import { randomBytes } from "crypto";
import { type Item } from "@/model/item";
import { saveData } from "@/server/api/action/cookies";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

// Define input field configuration for item properties
type InputFieldConfig = {
    type: 'text' | 'number';
    field: keyof Item;
    placeholder: string;
    className: string;
};

const INPUT_FIELDS: InputFieldConfig[] = [
    { type: 'text', field: 'name', placeholder: 'Name', className: 'w-full rounded-md' },
    { type: 'number', field: 'price', placeholder: 'Price', className: 'w-full rounded-md' },
    { type: 'number', field: 'volume', placeholder: 'Volume', className: 'w-full rounded-md' },
];

// Component for rendering a table row with editable inputs
function TableRowInput({ 
    item, 
    index, 
    onInputChange, 
    isMinimumRatio = false 
}: {
    item: Item;
    index: number;
    onInputChange: (index: number, field: keyof Item, value: string | number) => void;
    isMinimumRatio?: boolean;
}) {
    // Local state to handle changes without losing focus
    const [localValues, setLocalValues] = useState<Record<keyof Item, string | number>>({
        name: item.name,
        price: item.price,
        volume: item.volume
    });

    // Update local values when item prop changes
    useEffect(() => {
        setLocalValues({
            name: item.name,
            price: item.price,
            volume: item.volume
        });
    }, [item]);

    // Calculate the price/volume ratio
    const ratio = useMemo(() => {
        return item.volume > 0 ? item.price / item.volume : 0;
    }, [item.price, item.volume]);

    // Handle input change
    const handleChange = (field: keyof Item, value: string) => {
        setLocalValues(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle input blur (when user finishes editing)
    const handleBlur = (field: keyof Item) => {
        const value = field === 'name' ? localValues[field] : Number(localValues[field]);
        onInputChange(index, field, value);
    };

    // Dynamic row styling based on whether this item has the minimum ratio
    const rowClass = isMinimumRatio 
        ? "bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500"
        : "bg-slate-50 dark:bg-slate-800/40";

    return (
        <TableRow key={`item-${index}`} className={`${rowClass} transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/60`}>
            {INPUT_FIELDS.map(({ type, field, placeholder, className }) => (
                <TableCell key={`${index}-${field}`} className="py-2">
                    <Input
                        type={type}
                        placeholder={placeholder}
                        className={className}
                        value={localValues[field]}
                        onChange={(e) => handleChange(field, e.target.value)}
                        onBlur={() => handleBlur(field)}
                    />
                </TableCell>
            ))}
            <TableCell className="font-medium text-right">
                {ratio.toFixed(2)}
            </TableCell>
        </TableRow>
    );
}

// PriceTable component for showing the list of items
function PriceTable({ 
    data, 
    setData 
}: {
    data: Item[];
    setData: (data: Item[]) => void;
}) {
    // Calculate minimum price/volume ratio
    const { minRatio, minRatioItems } = useMemo(() => {
        if (data.length === 0) return { minRatio: 0, minRatioItems: new Set<number>() };
        
        const validItems = data.filter(item => item.volume > 0);
        if (validItems.length === 0) return { minRatio: 0, minRatioItems: new Set<number>() };
        
        // Calculate all ratios
        const ratios = validItems.map(item => item.price / item.volume);
        const minRatio = Math.min(...ratios);
        
        // Find indices of all items with minimum ratio
        const minRatioItems = new Set<number>();
        data.forEach((item, index) => {
            if (item.volume > 0 && item.price / item.volume === minRatio) {
                minRatioItems.add(index);
            }
        });
        
        return { minRatio, minRatioItems };
    }, [data]);

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
                [field]: field === 'name' ? value : Number(value)
            };
            setData(data.map((item, i) => i === index ? updatedItem : item));
        }
    }, [data, setData]);

    // If no data, show empty state
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

    // Otherwise show table
    return (
        <div className="w-full overflow-x-auto border rounded-lg shadow-sm border-slate-200">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-100 dark:bg-slate-800">
                        <TableHead className="whitespace-nowrap">Name</TableHead>
                        <TableHead className="whitespace-nowrap">Price</TableHead>
                        <TableHead className="whitespace-nowrap">Volume</TableHead>
                        <TableHead className="text-right whitespace-nowrap">Price/Volume</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item, index) => (
                        <TableRowInput
                            key={`${item.name}-${index}`}
                            item={item}
                            index={index}
                            onInputChange={handleInputChange}
                            isMinimumRatio={minRatioItems.has(index)}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

// Main Page component
export default function Page2({ data: initialData }: { data: Item[] }) {
    // Main state
    const [data, setData] = useState<Item[]>([]);
    const [dirty, setDirty] = useState(false);

    // Initialize data from props
    useEffect(() => {
        setData(initialData);
    }, [initialData]);

    // Handle data changes and save to cookies with debounce
    useEffect(() => {
        if (!dirty) return;

        const timeout = setTimeout(() => {
            saveData("data", data)
                .then(() => console.log("Data saved successfully"))
                .catch((error) => console.error("Failed to save data", error));
            setDirty(false);
        }, 1000);

        return () => clearTimeout(timeout);
    }, [data, dirty]);

    // Update data and mark as dirty
    const updateData = useCallback((newData: Item[]) => {
        setData(newData);
        setDirty(true);
    }, []);

    // Add a new item
    const addItem = useCallback(() => {
        const uniqueId = randomBytes(4).toString("hex");
        const newItem: Item = {
            name: `Item ${uniqueId.substring(0, 4)}`,
            price: 0,
            volume: 0,
        };
        updateData([...data, newItem]);
    }, [data, updateData]);

    // Clear all items
    const clearItems = useCallback(() => {
        updateData([]);
    }, [updateData]);

    return (
        <main className="flex flex-col w-full max-w-5xl min-h-screen px-4 mx-auto sm:px-6">
            <div className="flex items-center justify-center my-4 sm:my-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">ComPrice</h2>
            </div>
            
            <Separator className="mb-4" />
            
            <div className="flex-grow pb-4 mb-4">
                <PriceTable data={data} setData={updateData} />
            </div>
            
            <footer className="sticky bottom-0 left-0 right-0 px-4 py-4 dark:bg-slate-900 sm:px-0">
                <div className="flex items-center justify-between max-w-5xl gap-4 mx-auto">
                    <Button 
                        onClick={clearItems} 
                        variant="destructive"
                        size="lg"
                        className="flex-1 sm:flex-initial"
                    >
                        Clear All
                    </Button>
                    
                    <Button 
                        onClick={addItem} 
                        variant="default"
                        size="lg"
                        className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700"
                    >
                        Add Item
                    </Button>
                </div>
            </footer>
        </main>
    );
}


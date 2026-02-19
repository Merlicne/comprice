import { useState, useEffect } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { type Item, type Unit } from "@/model/item";

// Define input field configuration for item properties
type InputFieldConfig = {
    type: 'text' | 'number';
    field: keyof Item;
    placeholder: string;
    className: string;
};

const INPUT_FIELDS: InputFieldConfig[] = [
    { type: 'text', field: 'name', placeholder: 'Name', className: 'w-full rounded-md' },
    { type: 'text', field: 'price', placeholder: 'Price', className: 'w-full rounded-md' },
    { type: 'text', field: 'volume', placeholder: 'Volume', className: 'w-full rounded-md' },
];

const UNITS: Unit[] = ['pcs', 'kg', 'g', 'L', 'ml'];

export function TableRowInput({
    item,
    index,
    onInputChange,
    isMinimumRatio = false,
    normalizedPrice
}: {
    item: Item;
    index: number;
    onInputChange: (index: number, field: keyof Item, value: string | number) => void;
    isMinimumRatio?: boolean;
    normalizedPrice: number;
}) {
    // Local state to handle changes without losing focus
    const [localValues, setLocalValues] = useState<Record<keyof Item, string | number>>({
        name: item.name,
        price: item.price,
        volume: item.volume,
        unit: item.unit
    });

    // Update local values when item prop changes
    useEffect(() => {
        setLocalValues({
            name: item.name,
            price: item.price,
            volume: item.volume,
            unit: item.unit
        });
    }, [item]);

    // Handle input change
    const handleChange = (field: keyof Item, value: string) => {
        setLocalValues(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle input blur (when user finishes editing)
    const handleBlur = (field: keyof Item) => {
        const value = field === 'name' || field === 'unit' ? localValues[field] : Number(localValues[field]);
        onInputChange(index, field, value);
    };

    // Handle select change separately as it doesn't have blur event in same way
    const handleUnitChange = (value: Unit) => {
        setLocalValues(prev => ({ ...prev, unit: value }));
        onInputChange(index, 'unit', value);
    };

    // Dynamic row styling based on whether this item has the minimum ratio
    const rowClass = isMinimumRatio
        ? "bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500"
        : "bg-slate-50 dark:bg-slate-800/40";

    return (
        <TableRow className={`${rowClass} transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/60`}>
            <TableCell className="py-2">
                <Input
                    type="text"
                    placeholder="Name"
                    className="w-full rounded-md"
                    value={localValues.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                />
            </TableCell>
            <TableCell className="py-2">
                <Input
                    type="number"
                    placeholder="Price"
                    className="w-full rounded-md"
                    value={localValues.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    onBlur={() => handleBlur('price')}
                />
            </TableCell>
            <TableCell className="py-2">
                <div className="flex space-x-2">
                    <Input
                        type="number"
                        placeholder="Volume"
                        className="w-full rounded-md flex-grow"
                        value={localValues.volume}
                        onChange={(e) => handleChange('volume', e.target.value)}
                        onBlur={() => handleBlur('volume')}
                    />
                    <Select
                        value={localValues.unit as string}
                        onValueChange={handleUnitChange}
                    >
                        <SelectTrigger className="w-[80px]">
                            <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                            {UNITS.map(unit => (
                                <SelectItem key={unit} value={unit}>
                                    {unit}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </TableCell>
            <TableCell className="font-medium text-right">
                {isFinite(normalizedPrice) ? normalizedPrice.toFixed(4) : '-'}
            </TableCell>
        </TableRow>
    );
}

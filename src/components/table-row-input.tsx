"use client";

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

    // Dynamic row styling
    // Best Value: nice emerald tint. 
    // Normal: white with slate hover.
    const rowClass = isMinimumRatio
        ? "bg-emerald-50/70 hover:bg-emerald-100/60 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30"
        : "bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900/50";

    // Input Reset Style: looks like text until focused
    const inputClass = "h-9 border-transparent bg-transparent shadow-none hover:bg-black/5 dark:hover:bg-white/5 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:border-emerald-500 focus-visible:ring-1 focus-visible:ring-emerald-500/20 transition-all font-medium";

    return (
        <TableRow className={`${rowClass} group transition-colors border-b border-slate-100 dark:border-slate-800`}>
            <TableCell className="p-2 pl-4">
                <Input
                    type="text"
                    placeholder="Item Name"
                    className={`${inputClass} w-full`}
                    value={localValues.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                />
            </TableCell>
            <TableCell className="p-2">
                <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="0.00"
                    className={`${inputClass} w-full`}
                    value={localValues.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    onBlur={() => handleBlur('price')}
                />
            </TableCell>
            <TableCell className="p-2">
                <div className="flex items-center gap-1.5 bg-transparent rounded-md focus-within:ring-1 focus-within:ring-emerald-500/20 p-1">
                    <Input
                        type="number"
                        inputMode="decimal"
                        placeholder="Vol"
                        className={`${inputClass} flex-grow min-w-[60px]`}
                        value={localValues.volume}
                        onChange={(e) => handleChange('volume', e.target.value)}
                        onBlur={() => handleBlur('volume')}
                    />
                    <Select
                        value={localValues.unit as string}
                        onValueChange={handleUnitChange}
                    >
                        <SelectTrigger className="w-[70px] h-8 border-0 bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200/50 rounded-md text-xs font-medium focus:ring-0 px-2 gap-1">
                            <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent align="end">
                            {UNITS.map(unit => (
                                <SelectItem key={unit} value={unit} className="text-xs">
                                    {unit}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </TableCell>
            <TableCell className="p-2 pr-4 text-right">
                {isMinimumRatio ? (
                    <div className="inline-flex flex-col items-end">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums text-lg leading-none">
                            {isFinite(normalizedPrice) ? normalizedPrice.toFixed(4) : '-'}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500/80 mt-0.5">Best Value</span>
                    </div>
                ) : (
                    <span className="font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                        {isFinite(normalizedPrice) ? normalizedPrice.toFixed(4) : '-'}
                    </span>
                )}
            </TableCell>
        </TableRow>
    );
}

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

        <TableRow className={`${rowClass} group transition-colors border-b border-slate-100 dark:border-slate-800 flex flex-wrap sm:table-row p-3 sm:p-0 gap-2 sm:gap-0 relative`}>
            {/* Name - Full width on mobile */}
            <TableCell className="p-0 sm:p-2 sm:pl-4 w-full sm:w-auto border-0">
                <Input
                    type="text"
                    placeholder="Item Name"
                    className={`${inputClass} w-full text-base sm:text-sm`}
                    value={localValues.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                />
            </TableCell>

            {/* Container for Price and Volume on mobile to ensure they settle nicely */}
            <div className="contents sm:table-row">
                {/* Price - Half width on mobile */}
                <TableCell className="p-0 sm:p-2 w-1/2 sm:w-auto pr-1 sm:pr-2 border-0 block sm:table-cell">
                    <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 sm:hidden">$</span>
                        <Input
                            type="number"
                            inputMode="decimal"
                            placeholder="0.00"
                            className={`${inputClass} w-full pl-5 sm:pl-3 text-base sm:text-sm`}
                            value={localValues.price}
                            onChange={(e) => handleChange('price', e.target.value)}
                            onBlur={() => handleBlur('price')}
                        />
                    </div>
                </TableCell>

                {/* Volume - Half width on mobile */}
                <TableCell className="p-0 sm:p-2 w-1/2 sm:w-auto pl-1 sm:pl-2 border-0 block sm:table-cell">
                    <div className="flex items-center gap-1.5 bg-transparent rounded-md focus-within:ring-1 focus-within:ring-emerald-500/20 p-0 sm:p-1">
                        <Input
                            type="number"
                            inputMode="decimal"
                            placeholder="Vol"
                            className={`${inputClass} flex-grow min-w-[30px] text-base sm:text-sm`}
                            value={localValues.volume}
                            onChange={(e) => handleChange('volume', e.target.value)}
                            onBlur={() => handleBlur('volume')}
                        />
                        <Select
                            value={localValues.unit as string}
                            onValueChange={handleUnitChange}
                        >
                            <SelectTrigger className="w-[65px] sm:w-[70px] h-9 sm:h-8 border-0 bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200/50 rounded-md text-xs font-medium focus:ring-0 px-2 gap-1">
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
            </div>

            {/* Value Indicator - Absolute or sorted to bottom */}
            <TableCell className="p-0 sm:p-2 sm:pr-4 w-full sm:w-auto text-right border-0 flex items-center justify-between sm:block sm:mt-0 mt-1">
                <span className="text-xs text-slate-400 sm:hidden font-medium">Value:</span>
                {isMinimumRatio ? (
                    <div className="inline-flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-emerald-500 px-1.5 py-0.5 rounded-sm sm:text-emerald-500/80 sm:bg-transparent sm:px-0 sm:py-0 sm:mt-0.5 order-2 sm:order-2">Best</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums text-lg leading-none order-1 sm:order-1">
                            {isFinite(normalizedPrice) ? normalizedPrice.toFixed(4) : '-'}
                        </span>
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

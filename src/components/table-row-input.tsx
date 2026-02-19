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
    const [localValues, setLocalValues] = useState<Record<keyof Item, string | number>>({
        name: item.name,
        price: item.price,
        volume: item.volume,
        unit: item.unit
    });

    useEffect(() => {
        setLocalValues({
            name: item.name,
            price: item.price,
            volume: item.volume,
            unit: item.unit
        });
    }, [item]);

    const handleChange = (field: keyof Item, value: string) => {
        setLocalValues(prev => ({ ...prev, [field]: value }));
    };

    const handleBlur = (field: keyof Item) => {
        const value = field === 'name' || field === 'unit' ? localValues[field] : Number(localValues[field]);
        onInputChange(index, field, value);
    };

    const handleUnitChange = (value: Unit) => {
        setLocalValues(prev => ({ ...prev, unit: value }));
        onInputChange(index, 'unit', value);
    };

    const cardBg = isMinimumRatio
        ? "bg-emerald-50/70 dark:bg-emerald-950/20 border-l-2 border-emerald-400"
        : "bg-white dark:bg-slate-950 border-l-2 border-transparent";

    const rowClass = isMinimumRatio
        ? "bg-emerald-50/70 hover:bg-emerald-100/60 dark:bg-emerald-950/20"
        : "bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900/50";

    const inputClass = "h-9 border-transparent bg-transparent shadow-none hover:bg-black/5 dark:hover:bg-white/5 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:border-emerald-500 focus-visible:ring-1 focus-visible:ring-emerald-500/20 transition-all font-medium";

    const valueDisplay = isFinite(normalizedPrice) ? normalizedPrice.toFixed(4) : '-';

    const UnitSelect = () => (
        <Select value={localValues.unit as string} onValueChange={handleUnitChange}>
            <SelectTrigger className="w-[62px] h-8 border-0 bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200/50 rounded-md text-xs font-medium focus:ring-0 px-2 gap-0.5 shrink-0">
                <SelectValue placeholder="Unit" />
            </SelectTrigger>
            <SelectContent align="end">
                {UNITS.map(unit => (
                    <SelectItem key={unit} value={unit} className="text-xs">{unit}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    );

    return (
        <>
            {/* ── MOBILE CARD (hidden on sm+) ─────────────────────────── */}
            <tr className={`sm:hidden border-b border-slate-100 dark:border-slate-800 ${cardBg} transition-colors`}>
                <td className="p-3 w-full block">
                    <div className="flex flex-col gap-2">
                        {/* Row 1 : Name */}
                        <Input
                            type="text"
                            placeholder="Item Name"
                            className={`${inputClass} w-full text-base`}
                            value={localValues.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            onBlur={() => handleBlur('name')}
                        />
                        {/* Row 2 : Price | Volume+Unit | Value */}
                        <div className="flex items-center gap-2">
                            {/* Price */}
                            <div className="relative flex-1">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">$</span>
                                <Input
                                    type="number"
                                    inputMode="decimal"
                                    placeholder="0.00"
                                    className={`${inputClass} w-full pl-5 text-base`}
                                    value={localValues.price}
                                    onChange={(e) => handleChange('price', e.target.value)}
                                    onBlur={() => handleBlur('price')}
                                />
                            </div>
                            {/* Volume */}
                            <div className="flex items-center gap-1 flex-1">
                                <Input
                                    type="number"
                                    inputMode="decimal"
                                    placeholder="Vol"
                                    className={`${inputClass} flex-1 min-w-0 text-base`}
                                    value={localValues.volume}
                                    onChange={(e) => handleChange('volume', e.target.value)}
                                    onBlur={() => handleBlur('volume')}
                                />
                                <UnitSelect />
                            </div>
                            {/* Value badge */}
                            <div className="shrink-0 text-right min-w-[64px]">
                                {isMinimumRatio ? (
                                    <div className="flex flex-col items-end">
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums text-base leading-none">{valueDisplay}</span>
                                        <span className="text-[9px] font-bold uppercase tracking-wide text-emerald-500 mt-0.5">Best</span>
                                    </div>
                                ) : (
                                    <span className="font-semibold text-slate-400 tabular-nums text-sm">{valueDisplay}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </td>
            </tr>

            {/* ── DESKTOP TABLE ROW (hidden on mobile) ────────────────── */}
            <TableRow className={`hidden sm:table-row ${rowClass} transition-colors border-b border-slate-100 dark:border-slate-800`}>
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
                    <div className="flex items-center gap-1.5">
                        <Input
                            type="number"
                            inputMode="decimal"
                            placeholder="Vol"
                            className={`${inputClass} flex-grow`}
                            value={localValues.volume}
                            onChange={(e) => handleChange('volume', e.target.value)}
                            onBlur={() => handleBlur('volume')}
                        />
                        <UnitSelect />
                    </div>
                </TableCell>
                <TableCell className="p-2 pr-4 text-right">
                    {isMinimumRatio ? (
                        <div className="inline-flex flex-col items-end">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums text-lg leading-none">{valueDisplay}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500/80 mt-0.5">Best Value</span>
                        </div>
                    ) : (
                        <span className="font-semibold text-slate-500 dark:text-slate-400 tabular-nums">{valueDisplay}</span>
                    )}
                </TableCell>
            </TableRow>
        </>
    );
}

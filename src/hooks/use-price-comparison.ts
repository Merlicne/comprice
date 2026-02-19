import { useCallback, useMemo } from 'react';
import { type Item, type Unit } from '@/model/item';

const UNIT_CONVERSION: Record<Unit, number> = {
    'pcs': 1,
    'kg': 1000, // Normalize to grams or keep as base kg? Let's use internal base unit. 
    // Actually, price/volume is usually displayed per unit.
    // Let's normalize everything to a 'base' unit for comparison.
    // Liquid: ml. 1L = 1000ml.
    // Weight: g. 1kg = 1000g.
    // Count: pcs.
    'g': 1,
    'L': 1000,
    'ml': 1,
};

// Returns a normalized price-per-unit for comparison
const getNormalizedPrice = (item: Item): number => {
    if (item.volume <= 0 || item.price <= 0) return Infinity;

    const multiplier = UNIT_CONVERSION[item.unit];
    const totalBaseUnits = item.volume * multiplier;

    // Avoid division by zero
    if (totalBaseUnits === 0) return Infinity;

    return item.price / totalBaseUnits;
};

// Helper to format the ratio for display
export const formatRatio = (item: Item): string => {
    if (item.volume <= 0) return "-";

    // We want to display something friendly like "$0.50 / 100g" or "$2.00 / L"
    // For now, let's just stick to the calculation used in the table which was price / volume.
    // But with units, we should probably standardize. 
    // If unit is kg, ratio is price/kg.
    // If unit is g, ratio is price/g (likely tiny).
    // Let's keep strict price/volume for the provided unit for now to match UI expectation, 
    // but the comparison logic (green highlight) uses the normalized price.

    return (item.price / item.volume).toFixed(4); // standardized decimals
};


export function usePriceComparison(data: Item[]) {
    // Calculate stats
    const { minNormalizedPrice, bestValueIndices } = useMemo(() => {
        if (data.length === 0) return { minNormalizedPrice: Infinity, bestValueIndices: new Set<number>() };

        let minPrice = Infinity;
        const normalizedPrices = data.map(item => {
            const p = getNormalizedPrice(item);
            if (p < minPrice) minPrice = p;
            return p;
        });

        const bestIndices = new Set<number>();
        normalizedPrices.forEach((price, index) => {
            if (price !== Infinity && Math.abs(price - minPrice) < 0.000001) { // Float comparison
                bestIndices.add(index);
            }
        });

        return { minNormalizedPrice: minPrice, bestValueIndices: bestIndices };
    }, [data]);

    const sortedData = useMemo(() => {
        // Return a copy sorted by normalized price
        return [...data].sort((a, b) => getNormalizedPrice(a) - getNormalizedPrice(b));
    }, [data]);

    return {
        bestValueIndices,
        sortedData,
        getNormalizedPrice
    };
}

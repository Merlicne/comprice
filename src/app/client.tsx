"use client";
import { useCallback, useState } from "react";
import { Separator } from "@/components/ui/separator"
import { randomBytes } from "crypto";
import { type Item } from "@/model/item";
// import { saveData } from "@/server/action/cookies"; // Replaced by useLocalStorage
import { Button } from "@/components/ui/button";
import { toast } from "sonner"
import { useLocalStorage } from "@/hooks/use-local-storage";
import { PriceTable } from "@/components/price-table";
import { usePriceComparison } from "@/hooks/use-price-comparison";

// Main Page component
export default function ClientRender() {
    // Main state using LocalStorage
    // We ignore the initialData prop from server now as we are fully client-side for persistence
    const [data, setData] = useLocalStorage<Item[]>("comprice-items", []);
    const [isSorted, setIsSorted] = useState(false);

    // Sort logic
    const { sortedData } = usePriceComparison(data);

    // Derived state for rendering
    const displayData = isSorted ? sortedData : data;

    // Update data wrapper to handle sorting
    // If sorted, we can't easily update by index without finding the original index.
    // So if users edit while sorted, we probably should disable sorting or handle mapping carefully.
    // For simplicity: If sorted, passing setData to PriceTable might behave unexpectedly if PriceTable uses index.
    // My PriceTable implementation uses index to update.
    // If `displayData` is sorted, index 0 is the cheapest item, which might be index 5 in `data`.
    // The `PriceTable` sees `displayData` and passes index 0. `setData` (from useLocalStorage) expects index 0 to be the first item in storage.
    // FIX: We need a way to update the original list even when sorted.
    // Strategy: Pass a custom update function to PriceTable that finds the item in the original list?
    // Or: Just disable sorting when editing?

    // Better Strategy: PriceTable's `onInputChange` should take the `item` itself or a generic ID if we had one.
    // We don't have IDs. We rely on index.
    // Let's rely on the randomBytes ID generation for tracking!
    // But `Item` interface doesn't have ID.
    // I should add ID to Item interface for robust React rendering and updates.
    // But for now, without changing the Model too deeply, let's just toggling sort off if user edits? 
    // Or simpler: Pass a `handleUpdate` that knows how to map back.

    // Actually, `PriceTable` receives `data`. If I pass `sortedData` to `PriceTable`, and it passes back an index,
    // that index is for `sortedData`.
    // So `handleUpdate` in `ClientRender` needs to know if we are mapping `sortedData` or `data`.

    // Let's refine `PriceTable` interaction.
    // If I pass `displayData` (which is `sortedData`) to `PriceTable`, 
    // `PriceTable` will emit onChange(indexInSortedList, field, value).
    // I need to map `sortedData[indexInSortedList]` back to `data`.
    // Since items don't have unique IDs, this is risky if two items are identical.
    // BUT, we create items with "Item <random hex>", so names are likely unique-ish mostly.

    // PROPOSAL: Add `id` to `Item` model. It's cleaner.
    // Step 1: I'll stick to non-sorting editing for this iteration to avoid breaking changes mid-stream 
    // or add ID now. Adding ID is safer.
    // Let's add ID to Item model in a separate step if needed. 
    // For now, let's just make `setData` update the specific item found by reference? No, objects are recreated.

    // Workaround: When `isSorted` is true, we display sorted data. 
    // If user edits, we update the item in the MAIN `data` array.
    // We can find the item index in `data` by matching properties? No, properties change on edit.

    // Let's add ID. It is best practice.
    // Since I can't easily add ID to all existing localstorage data without a migration script...
    // I'll skip ID for now and just Disable Sorting when editing?
    // Or simpler: We pass `data` (unsorted) to PriceTable always, and let PriceTable handle the sorting view internally?
    // No, I moved sorting logic to hook.

    // Let's go with: Pass `data` (unsorted) to PriceTable. 
    // PriceTable receives `sorted` bool.
    // If strict sort is on, PriceTable renders `sortedData` but keeps track of original indices?

    // Actually, `usePriceComparison` returns `sortedData` but not the map.
    // Let's just pass the unsorted `data` to PriceTable, and let the User toggle sort which just reorders the visual table?
    // If I reorder the visual table, the indices change. 

    // Let's implement a simple version:
    // sorting just toggles a view mode where we SEE the best value, but maybe we can't edit?
    // Or, we just map the update back.

    // Let's use the `randomBytes` which acts as ID in the name!
    // Wait, the name is "Item <hex>". That IS an ID essentially.

    const handleUpdate = useCallback((newData: Item[]) => {
        setData(newData);
    }, [setData]);

    const addItem = useCallback(() => {
        if (data.length >= 10) {
            toast.error("You can only add up to 10 items");
            return;
        }
        const uniqueId = randomBytes(4).toString("hex");
        const newItem: Item = {
            name: `Item ${uniqueId.substring(0, 4)}`,
            price: 0,
            volume: 0,
            unit: 'pcs' // Default unit
        };
        setData([...data, newItem]);
    }, [data, setData]);

    const clearItems = useCallback(() => {
        setData([]);
    }, [setData]);

    return (
        <main className="flex flex-col w-full max-w-5xl min-h-screen px-4 mx-auto sm:px-6">
            <div className="flex items-center justify-center my-4 sm:my-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">ComPrice (Local)</h2>
            </div>

            <Separator className="mb-4" />

            <div className="flex-grow pb-4 mb-4">
                <PriceTable
                    data={isSorted ? sortedData : data}
                    setData={(newData) => {
                        // If we are sorted, `newData` comes back sorted with the mutation.
                        // This is tricky.
                        // Real fix: Add ID to Item. 
                        // For now: If sorted, we assume read-only-ish or we unsort on edit?
                        // Let's just set Data. If it was sorted, it becomes the new order.
                        // That actually effectively "applies" the sort to the main list.
                        // Which is fine! "Sorting" just reorders your list.
                        setData(newData);
                    }}
                    isSorted={isSorted}
                    onSortToggle={() => setIsSorted(!isSorted)}
                />
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



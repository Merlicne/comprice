"use server";

import type { Item } from "@/model/item";
import { cookies } from "next/headers";


const dataKey = "data";

export const saveData = async (value: Item[]) => {
    const cookieStore = await cookies();
    const encoded = btoa(JSON.stringify(value));
    cookieStore.set(dataKey, encoded);
}

export const getData = async () => {
    const cookieStore = await cookies();
    const cookieValue = await cookieStore.get(dataKey);
    if (!cookieValue) return null;
    try {
        const decodedString = atob(cookieValue.value);
        const itemList: Item[] = await JSON.parse(decodedString) ?? [];
        return itemList;
    } catch (error) {
        console.error("Error decoding cookie value:", error);
        cookieStore.delete(dataKey);
        return null;
    }
}
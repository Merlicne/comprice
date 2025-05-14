"use server";

import type { Item } from "@/model/item";
import { cookies } from "next/headers";


export const saveData = async (name: string, value: Item[]) => {
    const cookieStore = await cookies();
    cookieStore.set(name, JSON.stringify(value));
}

export const getData = async (name: string) => {
    const cookieStore = await cookies();
    const cookieValue = await cookieStore.get(name);
    if (!cookieValue) return await null;
    const itemList: Item[] = await JSON.parse(cookieValue.value) ?? [];
    return itemList;
}
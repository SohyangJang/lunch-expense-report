"use server";
import { db } from "@/lib/db";
import { restaurants } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
export async function getRestaurants(){return db.select().from(restaurants).orderBy(asc(restaurants.id));}
export async function addRestaurant(name:string,menu:string){
 const n=name.trim(); if(!n) throw new Error("식당명을 입력해주세요.");
 await db.insert(restaurants).values({name:n,menu:menu.trim()||null});
 revalidatePath("/"); revalidatePath("/restaurants"); revalidatePath("/records");
}
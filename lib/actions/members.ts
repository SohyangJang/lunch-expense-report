"use server";
import { db } from "@/lib/db";
import { members } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
export async function getMembers(){return db.select().from(members).orderBy(asc(members.id));}
export async function addMember(name:string,position:string){
 const n=name.trim(); if(!n) throw new Error("이름을 입력해주세요.");
 await db.insert(members).values({name:n,position:position.trim()||null});
 revalidatePath("/"); revalidatePath("/members"); revalidatePath("/records");
}
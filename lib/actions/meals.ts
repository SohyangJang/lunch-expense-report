"use server";
import { db } from "@/lib/db";
import { mealParticipants,mealRecords,members,restaurants } from "@/lib/db/schema";
import { desc,eq,sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
export type ParticipantInput={memberId:number;amount:number};
function currentMonth(){const n=new Date();return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}`;}
export async function getAvailableMonths(){
 const rows=await db.select({month:sql<string>`to_char(${mealRecords.mealDate}, 'YYYY-MM')`}).from(mealRecords)
 .groupBy(sql`to_char(${mealRecords.mealDate}, 'YYYY-MM')`).orderBy(desc(sql`to_char(${mealRecords.mealDate}, 'YYYY-MM')`));
 const months=new Set(rows.map(r=>r.month));months.add(currentMonth());return Array.from(months).sort((a,b)=>a<b?1:-1);
}
export async function getMealRecordsForMonth(month:string){
 const records=await db.select({id:mealRecords.id,mealDate:mealRecords.mealDate,totalAmount:mealRecords.totalAmount,restaurantId:mealRecords.restaurantId,restaurantName:restaurants.name})
 .from(mealRecords).leftJoin(restaurants,eq(mealRecords.restaurantId,restaurants.id))
 .where(sql`to_char(${mealRecords.mealDate}, 'YYYY-MM') = ${month}`).orderBy(desc(mealRecords.mealDate),desc(mealRecords.id));
 if(!records.length)return [];
 const ids=records.map(r=>r.id);
 const rows=await db.select({mealRecordId:mealParticipants.mealRecordId,memberId:mealParticipants.memberId,amount:mealParticipants.amount,memberName:members.name})
 .from(mealParticipants).leftJoin(members,eq(mealParticipants.memberId,members.id))
 .where(sql`${mealParticipants.mealRecordId} in ${ids}`);
 return records.map(r=>({...r,participants:rows.filter(p=>p.mealRecordId===r.id).map(p=>({memberId:p.memberId,name:p.memberName??"알수없음",amount:p.amount}))}));
}
export async function getSummaryForMonth(month:string){
 const records=await getMealRecordsForMonth(month), allMembers=await db.select().from(members), allRestaurants=await db.select().from(restaurants);
 const totalAmount=records.reduce((s,r)=>s+r.totalAmount,0),mealCount=records.length,avgPerMeal=mealCount?Math.round(totalAmount/mealCount):0;
 const perMember=allMembers.map(m=>{const rs=records.filter(r=>r.participants.some(p=>p.memberId===m.id));const totalForMember=rs.reduce((s,r)=>s+(r.participants.find(p=>p.memberId===m.id)?.amount??0),0);return{id:m.id,name:m.name,position:m.position,count:rs.length,totalAmount:totalForMember};});
 const totalParticipations=perMember.reduce((s,m)=>s+m.count,0);
 const avgPerPerson=totalParticipations?Math.round(perMember.reduce((s,m)=>s+m.totalAmount,0)/Math.max(allMembers.length,1)):0;
 const map=new Map<string,number>();for(const r of records){const n=r.restaurantName??"알수없음";map.set(n,(map.get(n)??0)+r.totalAmount);}
 const perRestaurant=Array.from(map.entries()).map(([name,amount])=>({name,amount})).sort((a,b)=>b.amount-a.amount);
 return{totalAmount,mealCount,avgPerMeal,avgPerPerson,perMember,perRestaurant,recentRecords:records.slice(0,5),memberCount:allMembers.length,restaurantCount:allRestaurants.length};
}
export async function addMealRecord(mealDate:string,restaurantId:number,participants:ParticipantInput[]){
 if(!mealDate)throw new Error("날짜를 선택해주세요.");if(!restaurantId)throw new Error("식당을 선택해주세요.");if(!participants.length)throw new Error("참여 인원을 선택해주세요.");
 const seen=new Set<number>();for(const p of participants){if(seen.has(p.memberId))throw new Error("같은 구성원을 중복 선택할 수 없습니다.");seen.add(p.memberId);if(!Number.isFinite(p.amount)||p.amount<=0)throw new Error("올바른 금액을 입력해주세요.");}
 const totalAmount=participants.reduce((s,p)=>s+p.amount,0);
 await db.transaction(async tx=>{const [record]=await tx.insert(mealRecords).values({mealDate,restaurantId,totalAmount}).returning({id:mealRecords.id});await tx.insert(mealParticipants).values(participants.map(p=>({mealRecordId:record.id,memberId:p.memberId,amount:p.amount})));});
 revalidatePath("/");revalidatePath("/records");revalidatePath("/members");revalidatePath("/restaurants");
}
import { integer, pgTable, serial, text, timestamp, date } from "drizzle-orm/pg-core";

export const members = pgTable("members", {
  id: serial("id").primaryKey(), name: text("name").notNull(), position: text("position"),
  createdAt: timestamp("created_at",{withTimezone:true}).notNull().defaultNow(),
});
export const restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(), name: text("name").notNull(), menu: text("menu"),
  createdAt: timestamp("created_at",{withTimezone:true}).notNull().defaultNow(),
});
export const mealRecords = pgTable("meal_records", {
  id: serial("id").primaryKey(), mealDate: date("meal_date",{mode:"string"}).notNull(),
  restaurantId: integer("restaurant_id").notNull(), totalAmount: integer("total_amount").notNull(),
  createdAt: timestamp("created_at",{withTimezone:true}).notNull().defaultNow(),
});
export const mealParticipants = pgTable("meal_participants", {
  id: serial("id").primaryKey(), mealRecordId: integer("meal_record_id").notNull(),
  memberId: integer("member_id").notNull(), amount: integer("amount").notNull(),
});
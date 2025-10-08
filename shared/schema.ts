import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, serial, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const drivers = pgTable("drivers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  vehicleModel: text("vehicle_model").notNull(),
  vehiclePlate: text("vehicle_plate").notNull(),
  pixKey: text("pix_key"),
  termsAccepted: integer("terms_accepted"), // 1 = accepted
  isOnline: integer("is_online").default(0).notNull(), // 0 = offline, 1 = online
  isApproved: integer("is_approved").default(0).notNull(), // 0 = pending, 1 = approved
  credits: integer("credits").default(0).notNull(), // Créditos disponíveis para corridas
  latitude: text("latitude"),
  longitude: text("longitude"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const passengers = pgTable("passengers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rides = pgTable("rides", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  passengerId: varchar("passenger_id").notNull(),
  driverId: varchar("driver_id"),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  passengerCount: integer("passenger_count").notNull(),
  status: text("status").notNull(), // pending, accepted, in_progress, completed, cancelled
  estimatedPrice: text("estimated_price"),
  paymentMethod: text("payment_method"), // 'pix' or 'cash'
  platformFeeStatus: text("platform_fee_status").default("pending"), // 'pending' or 'paid'
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  acceptedAt: timestamp("accepted_at"),
  completedAt: timestamp("completed_at"),
});

export const routePrices = pgTable("route_prices", {
  id: serial("id").primaryKey(),
  route: text("route").notNull().unique(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  driverId: varchar("driver_id").notNull(),
  rideId: varchar("ride_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  pixKey: text("pix_key").notNull(),
  notes: text("notes"),
  paidAt: timestamp("paid_at").defaultNow().notNull(),
});

export const creditPurchases = pgTable("credit_purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  driverId: varchar("driver_id").notNull(),
  credits: integer("credits").notNull(), // Quantidade de créditos comprados
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(), // Valor pago
  status: text("status").default("pending").notNull(), // pending, confirmed
  purchasedAt: timestamp("purchased_at").defaultNow().notNull(),
});

export const insertDriverSchema = createInsertSchema(drivers).omit({
  id: true,
  createdAt: true,
  isApproved: true,
});

export const driverLoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export const insertPassengerSchema = createInsertSchema(passengers).omit({
  id: true,
  createdAt: true,
});

export const insertRideSchema = createInsertSchema(rides).omit({
  id: true,
  requestedAt: true,
  acceptedAt: true,
  completedAt: true,
});

export const insertRoutePriceSchema = createInsertSchema(routePrices).omit({
  id: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  paidAt: true,
});

export const insertCreditPurchaseSchema = createInsertSchema(creditPurchases).omit({
  id: true,
  purchasedAt: true,
});

export type Driver = typeof drivers.$inferSelect;
export type Passenger = typeof passengers.$inferSelect;
export type Ride = typeof rides.$inferSelect;
export type RoutePrice = typeof routePrices.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type CreditPurchase = typeof creditPurchases.$inferSelect;
export type InsertDriver = z.infer<typeof insertDriverSchema>;
export type InsertPassenger = z.infer<typeof insertPassengerSchema>;
export type InsertRide = z.infer<typeof insertRideSchema>;
export type InsertRoutePrice = z.infer<typeof insertRoutePriceSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type InsertCreditPurchase = z.infer<typeof insertCreditPurchaseSchema>;
export type DriverLogin = z.infer<typeof driverLoginSchema>;

import { pgTable, text, serial, integer, boolean, timestamp, numeric, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Import auth models
export * from "./models/auth";
import { users } from "./models/auth";

// Profiles table to extend user information
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  role: text("role").notNull().default("customer"), // admin, owner, customer
  phoneNumber: text("phone_number"),
  licenseNumber: text("license_number"),
  bio: text("bio"),
});

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  licensePlate: text("license_plate").notNull(),
  pricePerDay: numeric("price_per_day").notNull(),
  location: text("location").notNull(),
  imageUrl: text("image_url").notNull(),
  available: boolean("available").default(true),
  features: jsonb("features").$type<string[]>(),
  gpsEnabled: boolean("gps_enabled").default(false),
  lat: numeric("lat"),
  lng: numeric("lng"),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  vehicleId: integer("vehicle_id").notNull().references(() => vehicles.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalPrice: numeric("total_price").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, active, completed, cancelled
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, paid, failed
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().references(() => bookings.id),
  amount: numeric("amount").notNull(),
  method: text("method").notNull().default("mpesa"),
  transactionId: text("transaction_id"),
  status: text("status").notNull().default("pending"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Relations
export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  owner: one(users, {
    fields: [vehicles.ownerId],
    references: [users.id],
  }),
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  customer: one(users, {
    fields: [bookings.customerId],
    references: [users.id],
  }),
  vehicle: one(vehicles, {
    fields: [bookings.vehicleId],
    references: [vehicles.id],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  }),
}));

// Schemas
export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true });
export const insertVehicleSchema = createInsertSchema(vehicles).omit({ id: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, status: true, paymentStatus: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, timestamp: true });

// Types
export type Profile = typeof profiles.$inferSelect;
export type Vehicle = typeof vehicles.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Payment = typeof payments.$inferSelect;

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

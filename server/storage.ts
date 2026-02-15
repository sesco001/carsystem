import { db } from "./db";
import {
  users, profiles, vehicles, bookings, payments,
  type User, type UpsertUser, type Profile, type InsertProfile,
  type Vehicle, type InsertVehicle, type Booking, type InsertBooking,
  type Payment, type InsertPayment
} from "@shared/schema";
import { eq, like, ilike, and, or, gte, lte, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Profiles
  getProfile(userId: string): Promise<Profile | undefined>;
  updateProfile(userId: string, profile: Partial<InsertProfile>): Promise<Profile>;
  createProfile(profile: InsertProfile): Promise<Profile>;

  // Vehicles
  getVehicles(filters?: { search?: string, location?: string, minPrice?: number, maxPrice?: number }): Promise<(Vehicle & { owner: { firstName: string | null, lastName: string | null } | null })[]>;
  getVehicle(id: number): Promise<(Vehicle & { owner: { firstName: string | null, lastName: string | null } | null }) | undefined>;
  getOwnerVehicles(ownerId: string): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle>;
  deleteVehicle(id: number): Promise<void>;

  // Bookings
  getBookings(userId: string, role: string): Promise<(Booking & { vehicle: Vehicle | null })[]>;
  getBooking(id: number): Promise<(Booking & { vehicle: Vehicle | null }) | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking>;

  // Payments
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(id: number, status: string): Promise<Payment>;
}

export class DatabaseStorage implements IStorage {
  // Profiles
  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const [newProfile] = await db.insert(profiles).values(profile).returning();
    return newProfile;
  }

  async updateProfile(userId: string, update: Partial<InsertProfile>): Promise<Profile> {
    const [updated] = await db.update(profiles)
      .set(update)
      .where(eq(profiles.userId, userId))
      .returning();
    return updated;
  }

  // Vehicles
  async getVehicles(filters?: { search?: string, location?: string, minPrice?: number, maxPrice?: number }): Promise<(Vehicle & { owner: { firstName: string | null, lastName: string | null } | null })[]> {
    let query = db.select({
      vehicle: vehicles,
      owner: {
        firstName: users.firstName,
        lastName: users.lastName
      }
    }).from(vehicles).leftJoin(users, eq(vehicles.ownerId, users.id));

    const conditions = [];
    if (filters) {
      if (filters.search) {
        conditions.push(or(ilike(vehicles.make, `%${filters.search}%`), ilike(vehicles.model, `%${filters.search}%`)));
      }
      if (filters.location) {
        conditions.push(like(vehicles.location, `%${filters.location}%`));
      }
      if (filters.minPrice) {
        conditions.push(gte(sql`CAST(${vehicles.pricePerDay} AS DECIMAL)`, filters.minPrice));
      }
      if (filters.maxPrice) {
        conditions.push(lte(sql`CAST(${vehicles.pricePerDay} AS DECIMAL)`, filters.maxPrice));
      }
    }
    
    if (conditions.length > 0) {
      // @ts-ignore
      query.where(and(...conditions));
    }

    const results = await query;
    return results.map(r => ({ ...r.vehicle, owner: r.owner }));
  }

  async getVehicle(id: number): Promise<(Vehicle & { owner: { firstName: string | null, lastName: string | null } | null }) | undefined> {
    const result = await db.select({
      vehicle: vehicles,
      owner: {
        firstName: users.firstName,
        lastName: users.lastName
      }
    })
    .from(vehicles)
    .leftJoin(users, eq(vehicles.ownerId, users.id))
    .where(eq(vehicles.id, id));

    if (result.length === 0) return undefined;
    return { ...result[0].vehicle, owner: result[0].owner };
  }

  async getOwnerVehicles(ownerId: string): Promise<Vehicle[]> {
    return await db.select().from(vehicles).where(eq(vehicles.ownerId, ownerId));
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const [newVehicle] = await db.insert(vehicles).values(vehicle as any).returning();
    return newVehicle;
  }

  async updateVehicle(id: number, update: Partial<InsertVehicle>): Promise<Vehicle> {
    const [updated] = await db.update(vehicles)
      .set(update as any)
      .where(eq(vehicles.id, id))
      .returning();
    return updated;
  }

  async deleteVehicle(id: number): Promise<void> {
    await db.delete(vehicles).where(eq(vehicles.id, id));
  }

  // Bookings
  async getBookings(userId: string, role: string): Promise<(Booking & { vehicle: Vehicle | null })[]> {
    if (role === 'customer') {
      const results = await db.select({
        booking: bookings,
        vehicle: vehicles
      })
      .from(bookings)
      .leftJoin(vehicles, eq(bookings.vehicleId, vehicles.id))
      .where(eq(bookings.customerId, userId))
      .orderBy(desc(bookings.startDate));
      
      return results.map(r => ({ ...r.booking, vehicle: r.vehicle }));
    } else if (role === 'owner') {
      // Get bookings for vehicles owned by this user
      const results = await db.select({
        booking: bookings,
        vehicle: vehicles
      })
      .from(bookings)
      .innerJoin(vehicles, eq(bookings.vehicleId, vehicles.id))
      .where(eq(vehicles.ownerId, userId))
      .orderBy(desc(bookings.startDate));

      return results.map(r => ({ ...r.booking, vehicle: r.vehicle }));
    }
    return [];
  }

  async getBooking(id: number): Promise<(Booking & { vehicle: Vehicle | null }) | undefined> {
    const result = await db.select({
      booking: bookings,
      vehicle: vehicles
    })
    .from(bookings)
    .leftJoin(vehicles, eq(bookings.vehicleId, vehicles.id))
    .where(eq(bookings.id, id));

    if (result.length === 0) return undefined;
    return { ...result[0].booking, vehicle: result[0].vehicle };
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking> {
    const [updated] = await db.update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();
    return updated;
  }

  // Payments
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }
  
  async updatePaymentStatus(id: number, status: string): Promise<Payment> {
    const [updated] = await db.update(payments)
      .set({ status })
      .where(eq(payments.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();

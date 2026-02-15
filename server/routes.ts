import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  // Profiles
  app.get(api.profiles.get.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const profile = await storage.getProfile(userId);
    if (!profile) {
      // Create default profile if not exists
      const newProfile = await storage.createProfile({ userId, role: "customer" });
      return res.json(newProfile);
    }
    res.json(profile);
  });

  app.put(api.profiles.update.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const input = api.profiles.update.input.parse(req.body);
      const updated = await storage.updateProfile(userId, input);
      res.json(updated);
    } catch (error) {
       if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Vehicles
  app.get(api.vehicles.list.path, async (req, res) => {
    try {
      const filters = api.vehicles.list.input?.parse(req.query);
      const parsedFilters = filters ? {
        ...filters,
        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined
      } : undefined;
      
      const vehicles = await storage.getVehicles(parsedFilters);
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ message: "Error fetching vehicles" });
    }
  });

  app.get(api.vehicles.get.path, async (req, res) => {
    const id = Number(req.params.id);
    const vehicle = await storage.getVehicle(id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.json(vehicle);
  });

  app.post(api.vehicles.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // Ensure profile exists
      let profile = await storage.getProfile(userId);
      if (!profile) {
        profile = await storage.createProfile({ userId, role: "owner" });
      } else if (profile.role !== "owner" && profile.role !== "admin") {
         await storage.updateProfile(userId, { role: "owner" });
      }

      const input = api.vehicles.create.input.parse(req.body);
      const vehicle = await storage.createVehicle({ ...input, ownerId: userId });
      res.status(201).json(vehicle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error creating vehicle" });
    }
  });

  app.put(api.vehicles.update.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const id = Number(req.params.id);
    const vehicle = await storage.getVehicle(id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    if (vehicle.ownerId !== userId) return res.status(403).json({ message: "Forbidden" });

    try {
      const input = api.vehicles.update.input.parse(req.body);
      const updated = await storage.updateVehicle(id, input);
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.delete(api.vehicles.delete.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const id = Number(req.params.id);
    const vehicle = await storage.getVehicle(id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    if (vehicle.ownerId !== userId) return res.status(403).json({ message: "Forbidden" });

    await storage.deleteVehicle(id);
    res.status(204).send();
  });

  // Bookings
  app.post(api.bookings.create.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const input = api.bookings.create.input.parse(req.body);
      
      const vehicle = await storage.getVehicle(input.vehicleId);
      if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
      
      const start = new Date(input.startDate);
      const end = new Date(input.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const totalPrice = (Number(vehicle.pricePerDay) * days).toString();

      const booking = await storage.createBooking({
        ...input,
        customerId: userId,
        totalPrice,
        startDate: start,
        endDate: end
      });
      res.status(201).json(booking);
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: "Invalid booking data" });
    }
  });

  app.get(api.bookings.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const profile = await storage.getProfile(userId);
    const role = profile?.role || "customer";
    const bookings = await storage.getBookings(userId, role);
    res.json(bookings);
  });

  // Payments (Simulation)
  app.post(api.payments.create.path, isAuthenticated, async (req: any, res) => {
     try {
       const input = api.payments.create.input.parse(req.body);
       const { bookingId, phoneNumber } = input;
       
       const booking = await storage.getBooking(bookingId);
       if (!booking) return res.status(404).json({ message: "Booking not found" });

       const payment = await storage.createPayment({
         bookingId,
         amount: booking.totalPrice,
         method: "mpesa",
         status: "completed", // Simulate success
         transactionId: "MPS" + Math.floor(Math.random() * 1000000)
       });

       await storage.updateBookingStatus(bookingId, "active");
       await storage.updatePaymentStatus(payment.id, "completed");

       res.status(201).json(payment);
     } catch (error) {
       res.status(500).json({ message: "Payment failed" });
     }
  });

  return httpServer;
}

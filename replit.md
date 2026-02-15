# NorthEast Rides - Car Rental System

## Overview
Car rental system for North Eastern Kenya (Garissa, Wajir, Mandera). Features vehicle browsing, booking with simulated M-Pesa payment, user authentication via Replit Auth, and role-based dashboards.

## Architecture
- **Frontend**: React + Vite + TanStack Query + wouter routing + shadcn/ui + Tailwind CSS
- **Backend**: Express.js with Drizzle ORM
- **Database**: PostgreSQL (Neon-backed via Replit)
- **Auth**: Replit Auth (OIDC) supporting Google, GitHub, email/password

## Key Files
- `shared/schema.ts` - Database schema (users, sessions, profiles, vehicles, bookings, payments)
- `shared/routes.ts` - API contract with Zod validation
- `server/routes.ts` - Express API routes
- `server/storage.ts` - Database storage interface
- `client/src/pages/` - Home, Vehicles, VehicleDetails, Dashboard
- `client/src/components/` - Navigation, VehicleCard, BookingForm
- `client/src/hooks/use-auth.ts` - Auth hook
- `client/src/hooks/use-data.ts` - Data fetching hooks

## User Roles
- **Customer**: Browse vehicles, make bookings, pay via M-Pesa
- **Owner**: List vehicles, manage bookings for their fleet
- **Admin**: Full access (role set manually in DB)

## API Endpoints
- `GET /api/vehicles` - List vehicles (public)
- `GET /api/vehicles/:id` - Vehicle details (public)
- `POST /api/vehicles` - Create vehicle (auth, upgrades to owner)
- `POST /api/bookings` - Create booking (auth)
- `GET /api/bookings` - List user bookings (auth)
- `POST /api/payments` - Simulated M-Pesa payment (auth)
- `GET /api/profile` - Get/create profile (auth)

## Running
- `npm run dev` starts Express + Vite on port 5000
- `npm run db:push` syncs schema to database

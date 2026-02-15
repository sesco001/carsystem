import { z } from 'zod';
import { insertVehicleSchema, insertBookingSchema, insertProfileSchema, vehicles, bookings, profiles, insertPaymentSchema, payments } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  profiles: {
    get: {
      method: 'GET' as const,
      path: '/api/profile' as const,
      responses: {
        200: z.custom<typeof profiles.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/profile' as const,
      input: insertProfileSchema.omit({ userId: true }).partial(),
      responses: {
        200: z.custom<typeof profiles.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  vehicles: {
    list: {
      method: 'GET' as const,
      path: '/api/vehicles' as const,
      input: z.object({
        search: z.string().optional(),
        location: z.string().optional(),
        minPrice: z.string().optional(),
        maxPrice: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof vehicles.$inferSelect & { owner?: { firstName: string | null, lastName: string | null } }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/vehicles/:id' as const,
      responses: {
        200: z.custom<typeof vehicles.$inferSelect & { owner?: { firstName: string | null, lastName: string | null } }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/vehicles' as const,
      input: insertVehicleSchema.omit({ ownerId: true }),
      responses: {
        201: z.custom<typeof vehicles.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/vehicles/:id' as const,
      input: insertVehicleSchema.omit({ ownerId: true }).partial(),
      responses: {
        200: z.custom<typeof vehicles.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/vehicles/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  bookings: {
    list: {
      method: 'GET' as const,
      path: '/api/bookings' as const, // For customer or owner
      responses: {
        200: z.array(z.custom<typeof bookings.$inferSelect & { vehicle?: typeof vehicles.$inferSelect }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/bookings' as const,
      input: insertBookingSchema.omit({ customerId: true, totalPrice: true }).extend({ startDate: z.coerce.date(), endDate: z.coerce.date() }),
      responses: {
        201: z.custom<typeof bookings.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/bookings/:id' as const,
      responses: {
        200: z.custom<typeof bookings.$inferSelect & { vehicle?: typeof vehicles.$inferSelect }>(),
        404: errorSchemas.notFound,
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/bookings/:id/status' as const,
      input: z.object({ status: z.string() }),
      responses: {
        200: z.custom<typeof bookings.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  payments: {
    create: {
      method: 'POST' as const,
      path: '/api/payments' as const,
      input: z.object({ bookingId: z.number(), phoneNumber: z.string() }),
      responses: {
        201: z.custom<typeof payments.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    process: { // Webhook or simulation endpoint
      method: 'POST' as const,
      path: '/api/payments/process' as const,
      input: z.object({ paymentId: z.number(), status: z.string() }),
      responses: {
        200: z.object({ success: z.boolean() }),
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

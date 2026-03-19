import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z
    .string()
    .regex(/^\+258[0-9]{9}$/, "Número inválido. Use formato +258841234567"),
  email: z.string().email().optional().or(z.literal("")),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  role: z.enum(["passenger", "driver"]),
});

export const bookingSchema = z.object({
  trip_id: z.string().uuid(),
  pickup_stop_id: z.string().uuid(),
  dropoff_stop_id: z.string().uuid(),
  seat_number: z.number().int().min(1).max(20),
  payment_method: z.enum(["mpesa", "emola", "wallet"]),
});

export const paymentSchema = z.object({
  booking_id: z.string().uuid(),
  provider: z.enum(["mpesa", "emola", "wallet"]),
  phone: z.string().regex(/^\+258[0-9]{9}$/),
});

export const tripStatusSchema = z.object({
  status: z.enum(["en_route", "at_stop", "completed"]),
});

export const locationSchema = z.object({
  trip_id: z.string().uuid(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  heading: z.number().min(0).max(360),
  speed: z.number().min(0),
});

export const ratingSchema = z.object({
  booking_id: z.string().uuid(),
  score: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export const sosSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  trip_id: z.string().uuid().optional(),
  address: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type TripStatusInput = z.infer<typeof tripStatusSchema>;
export type LocationInput = z.infer<typeof locationSchema>;
export type RatingInput = z.infer<typeof ratingSchema>;
export type SOSInput = z.infer<typeof sosSchema>;


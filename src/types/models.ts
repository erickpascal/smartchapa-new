export type UserRole = "passenger" | "driver" | "operator" | "admin";
export type TripStatus =
  | "scheduled"
  | "en_route"
  | "at_stop"
  | "completed"
  | "cancelled";
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";
export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";
export type PaymentProvider = "mpesa" | "emola" | "wallet";
export type VehicleStatus = "active" | "inactive" | "maintenance";
export type DocumentStatus = "pending" | "approved" | "rejected";

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  wallet_balance: number;
  preferred_language: "pt" | "en";
  avatar_url?: string;
  created_at: string;
}

export interface Route {
  id: string;
  name: string;
  start_stop_id: string;
  end_stop_id: string;
  distance_km: number;
  base_fare: number;
  category: "chapa" | "metro" | "expresso";
  is_active: boolean;
}

export interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  route_id: string;
  sequence_order: number;
}

export interface Trip {
  id: string;
  route_id: string;
  vehicle_id: string;
  driver_id: string;
  status: TripStatus;
  depart_time: string;
  arrive_time: string;
  available_seats: number;
  total_seats: number;
}

export interface Booking {
  id: string;
  trip_id: string;
  passenger_id: string;
  pickup_stop_id: string;
  dropoff_stop_id: string;
  seat_number: number;
  fare: number;
  status: BookingStatus;
  payment_method: PaymentProvider;
  created_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  provider: PaymentProvider;
  transaction_ref: string;
  status: PaymentStatus;
  created_at: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  capacity: number;
  model: string;
  year: number;
  operator_id: string;
  status: VehicleStatus;
}

export interface DriverLocation {
  driver_id: string;
  trip_id: string;
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  timestamp: string;
}

export interface Rating {
  id: string;
  booking_id: string;
  passenger_id: string;
  driver_id: string;
  score: number;
  comment?: string;
  created_at: string;
}


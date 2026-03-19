import { create } from "zustand";
import type { Trip, Stop, PaymentProvider } from "@/types/database";

interface BookingStore {
  selectedTrip: Trip | null;
  selectedSeat: number | null;
  pickupStop: Stop | null;
  dropoffStop: Stop | null;
  paymentMethod: PaymentProvider | null;
  setSelectedTrip: (trip: Trip | null) => void;
  setSelectedSeat: (seat: number | null) => void;
  setPickupStop: (stop: Stop | null) => void;
  setDropoffStop: (stop: Stop | null) => void;
  setPaymentMethod: (method: PaymentProvider | null) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingStore>((set) => ({
  selectedTrip: null,
  selectedSeat: null,
  pickupStop: null,
  dropoffStop: null,
  paymentMethod: null,
  setSelectedTrip: (trip) => set({ selectedTrip: trip }),
  setSelectedSeat: (seat) => set({ selectedSeat: seat }),
  setPickupStop: (stop) => set({ pickupStop: stop }),
  setDropoffStop: (stop) => set({ dropoffStop: stop }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  reset: () =>
    set({
      selectedTrip: null,
      selectedSeat: null,
      pickupStop: null,
      dropoffStop: null,
      paymentMethod: null,
    }),
}));


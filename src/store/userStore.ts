import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/database";

interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    { name: "smartchapa-user" },
  ),
);


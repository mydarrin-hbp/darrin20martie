import { create } from "zustand";

import type { CatalogService } from "../services/api";

export type ServiceLevel = "bronze" | "silver" | "gold" | "platinum";

export type CartItem = {
  serviceId: number;
  name: string;
  description?: string | null;
  level: ServiceLevel;
  price: number;
};

const LEVEL_PRICES: Record<ServiceLevel, number> = {
  bronze: 250,
  silver: 450,
  gold: 700,
  platinum: 1100,
};

type CartState = {
  items: CartItem[];
  addToCart: (service: CatalogService, level: ServiceLevel) => void;
  removeFromCart: (serviceId: number) => void;
  updateLevel: (serviceId: number, level: ServiceLevel) => void;
  clearCart: () => void;
};

export function getLevelPrice(level: ServiceLevel) {
  return LEVEL_PRICES[level];
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addToCart: (service, level) =>
    set((state) => {
      const existing = state.items.find((item) => item.serviceId === service.id);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.serviceId === service.id ? { ...item, level, price: getLevelPrice(level) } : item,
          ),
        };
      }

      return {
        items: [
          ...state.items,
          {
            serviceId: service.id,
            name: service.name,
            description: service.description,
            level,
            price: getLevelPrice(level),
          },
        ],
      };
    }),
  removeFromCart: (serviceId) => set((state) => ({ items: state.items.filter((item) => item.serviceId !== serviceId) })),
  updateLevel: (serviceId, level) =>
    set((state) => ({
      items: state.items.map((item) => (item.serviceId === serviceId ? { ...item, level, price: getLevelPrice(level) } : item)),
    })),
  clearCart: () => set({ items: [] }),
}));

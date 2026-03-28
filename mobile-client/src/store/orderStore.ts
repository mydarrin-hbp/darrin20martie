import { create } from "zustand";

import type { CartItem } from "./cartStore";
import type { OrderSummary } from "../services/api";

type OrderState = {
  localOrders: OrderSummary[];
  syncedOrders: OrderSummary[];
  placeOrder: (payload: { items: CartItem[]; address: string }) => OrderSummary;
  syncOrders: (remoteOrders: OrderSummary[]) => Array<{ id: string; from?: string; to: string }>;
};

export const useOrderStore = create<OrderState>((set) => ({
  localOrders: [],
  syncedOrders: [],
  placeOrder: ({ items, address }) => {
    const order: OrderSummary = {
      id: `LOCAL-${Date.now()}`,
      status: "PENDING",
      address,
      total: items.reduce((sum, item) => sum + item.price, 0),
      createdAt: new Date().toLocaleString(),
      items: items.map((item) => ({
        serviceId: item.serviceId,
        name: item.name,
        level: item.level,
        price: item.price,
      })),
    };

    set((state) => ({ localOrders: [order, ...state.localOrders] }));
    return order;
  },
  syncOrders: (remoteOrders) => {
    const now = Date.now();
    let transitions: Array<{ id: string; from?: string; to: string }> = [];

    set((state) => {
      const upgradedLocalOrders = state.localOrders.map((order) => {
        const ageMs = now - new Date(order.createdAt).getTime();
        let nextStatus = order.status;

        if (ageMs >= 60000) {
          nextStatus = "COMPLETED";
        } else if (ageMs >= 30000) {
          nextStatus = "IN_PROGRESS";
        }

        if (nextStatus !== order.status) {
          transitions.push({ id: order.id, from: order.status, to: nextStatus });
        }

        return { ...order, status: nextStatus };
      });

      const merged = [...upgradedLocalOrders, ...remoteOrders];
      const seen = new Set<string>();
      const syncedOrders = merged.filter((item) => {
        if (seen.has(item.id)) {
          return false;
        }
        seen.add(item.id);
        return true;
      });

      return {
        localOrders: upgradedLocalOrders,
        syncedOrders,
      };
    });

    return transitions;
  },
}));

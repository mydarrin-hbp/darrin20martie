import axios from "axios";

import { appConfig } from "./config";
import { getToken } from "./storage";

export const api = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 20000,
});

api.interceptors.request.use(async (config) => {
  config.headers["X-Gate-Authorization"] = appConfig.backendGateAuthorization;
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function loginRequest(email: string, password: string) {
  const response = await api.post("/api/v1/auth/login", { email, password });
  return response.data as {
    access_token: string;
    token_type: string;
    user_id: number;
    email: string;
    role: string;
    verification_status: string;
  };
}

export type CatalogService = {
  id: number;
  name: string;
  slug?: string;
  description?: string | null;
};

export async function getServices() {
  const response = await api.get("/api/v1/catalog/services");
  return response.data as CatalogService[];
}

export async function getServiceById(serviceId: number) {
  const response = await api.get(`/api/v1/catalog/services/${serviceId}`);
  return response.data as CatalogService;
}

export type OrderStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export type OrderItem = {
  serviceId: number;
  name: string;
  level: "bronze" | "silver" | "gold" | "platinum";
  price: number;
};

export type OrderSummary = {
  id: string;
  status: OrderStatus;
  address: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
};

const demoOrders: OrderSummary[] = [
  {
    id: "CMD-2001",
    status: "PENDING",
    address: "Bd. Unirii 10, Bucuresti",
    total: 450,
    createdAt: "2026-03-21 09:00",
    items: [{ serviceId: 1, name: "Montaj centrala termica", level: "silver", price: 450 }],
  },
  {
    id: "CMD-2002",
    status: "IN_PROGRESS",
    address: "Str. Lalelelor 7, Cluj-Napoca",
    total: 700,
    createdAt: "2026-03-20 14:30",
    items: [{ serviceId: 2, name: "Renovare baie la cheie", level: "gold", price: 700 }],
  },
  {
    id: "CMD-2003",
    status: "COMPLETED",
    address: "Str. Pacii 14, Brasov",
    total: 1100,
    createdAt: "2026-03-18 11:15",
    items: [{ serviceId: 3, name: "Refacere instalatie electrica", level: "platinum", price: 1100 }],
  },
];

export async function getOrders() {
  try {
    const response = await api.get("/api/v1/orders");
    return response.data as OrderSummary[];
  } catch {
    return demoOrders;
  }
}

export async function getOrderById(orderId: string) {
  try {
    const response = await api.get(`/api/v1/orders/${orderId}`);
    return response.data as OrderSummary;
  } catch {
    const fallback = demoOrders.find((item) => item.id === orderId);
    if (!fallback) {
      throw new Error("Order not found");
    }
    return fallback;
  }
}

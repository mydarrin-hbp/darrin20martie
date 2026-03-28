import { useEffect, useState } from "react";

import { AppNavigator } from "./AppNavigator";
import { AuthNavigator } from "./AuthNavigator";
import { getOrders } from "../services/api";
import { initNotifications, sendLocalNotification } from "../services/notifications";
import { useAuthStore } from "../store/authStore";
import { useOrderStore } from "../store/orderStore";

export function RootNavigator() {
  const token = useAuthStore((state) => state.token);
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const syncOrders = useOrderStore((state) => state.syncOrders);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    restoreSession().finally(() => setReady(true));
  }, [restoreSession]);

  useEffect(() => {
    if (!token) {
      return;
    }

    initNotifications().catch(() => undefined);

    const runSync = async () => {
      const orders = await getOrders();
      const changes = syncOrders(orders);
      for (const change of changes) {
        await sendLocalNotification("My Darrin Partner", `Comanda ${change.id} este acum ${change.to}.`);
      }
    };

    runSync().catch(() => undefined);
    const interval = setInterval(() => {
      runSync().catch(() => undefined);
    }, 30000);

    return () => clearInterval(interval);
  }, [token, syncOrders]);

  if (!ready) {
    return null;
  }

  return token ? <AppNavigator /> : <AuthNavigator />;
}

import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { i18n } from "../i18n";
import { getOrderById, OrderItem, OrderSummary } from "../services/api";
import { useOrderStore } from "../store/orderStore";
import { tokens } from "../theme/tokens";

function statusLabel(status: OrderSummary["status"]) {
  if (status === "PENDING") {
    return i18n.t("pending");
  }
  if (status === "IN_PROGRESS") {
    return i18n.t("inProgress");
  }
  return i18n.t("completed");
}

export function OrderDetailScreen({ route }: { route: any }) {
  const { orderId, localOrder } = route.params ?? {};
  const localOrders = useOrderStore((state) => state.localOrders);
  const syncedOrders = useOrderStore((state) => state.syncedOrders);
  const [remoteOrder, setRemoteOrder] = useState<OrderSummary | null>(null);

  useEffect(() => {
    if (typeof orderId === "string" && !localOrder) {
      getOrderById(orderId).then(setRemoteOrder).catch(() => undefined);
    }
  }, [orderId, localOrder]);

  const order = useMemo(
    () => localOrder ?? syncedOrders.find((item) => item.id === orderId) ?? localOrders.find((item) => item.id === orderId) ?? remoteOrder,
    [localOrder, syncedOrders, localOrders, orderId, remoteOrder],
  );

  if (!order) {
    return null;
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: tokens.colors.background }} contentContainerStyle={{ padding: tokens.spacing.lg }}>
      <View
        style={{
          marginTop: 48,
          backgroundColor: tokens.colors.panel,
          borderRadius: tokens.radius.lg,
          padding: tokens.spacing.xl,
          gap: tokens.spacing.md,
          borderWidth: 1,
          borderColor: tokens.colors.border,
        }}
      >
        <Text style={{ fontFamily: tokens.typography.bold, fontSize: 28, color: tokens.colors.text }}>{i18n.t("orderDetails")}</Text>
        <Text style={{ fontFamily: tokens.typography.bold, color: tokens.colors.text }}>{order.id}</Text>
        <Text style={{ fontFamily: tokens.typography.medium, color: tokens.colors.text }}>
          {i18n.t("liveStatus")}: {statusLabel(order.status)}
        </Text>
        <Text style={{ fontFamily: tokens.typography.regular, color: tokens.colors.muted }}>
          {i18n.t("serviceAddress")}: {order.address}
        </Text>
        <Text style={{ fontFamily: tokens.typography.regular, color: tokens.colors.muted }}>
          {i18n.t("createdAt")}: {order.createdAt}
        </Text>

        {order.items.map((item: OrderItem) => (
          <View key={`${order.id}-${item.serviceId}`} style={{ backgroundColor: tokens.colors.sand, borderRadius: tokens.radius.md, padding: tokens.spacing.md, gap: 4 }}>
            <Text style={{ fontFamily: tokens.typography.bold, color: tokens.colors.text }}>{item.name}</Text>
            <Text style={{ fontFamily: tokens.typography.regular, color: tokens.colors.muted }}>
              {i18n.t(item.level)} - {item.price} RON
            </Text>
          </View>
        ))}

        <Text style={{ fontFamily: tokens.typography.bold, fontSize: 20, color: tokens.colors.text }}>
          {i18n.t("total")}: {order.total} RON
        </Text>
      </View>
    </ScrollView>
  );
}

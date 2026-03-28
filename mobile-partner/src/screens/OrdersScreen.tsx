import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";

import { i18n } from "../i18n";
import { getOrders, OrderSummary } from "../services/api";
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

export function OrdersScreen({ navigation }: { navigation: any }) {
  const syncedOrders = useOrderStore((state) => state.syncedOrders);
  const syncOrders = useOrderStore((state) => state.syncOrders);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders()
      .then((orders) => {
        syncOrders(orders);
      })
      .finally(() => setLoading(false));
  }, [syncOrders]);

  const orders = useMemo(() => syncedOrders, [syncedOrders]);

  return (
    <View style={{ flex: 1, backgroundColor: tokens.colors.background, padding: tokens.spacing.lg }}>
      <Text style={{ marginTop: 48, marginBottom: tokens.spacing.lg, fontFamily: tokens.typography.bold, fontSize: 28, color: tokens.colors.text }}>
        {i18n.t("ordersTitle")}
      </Text>

      {loading ? (
        <View style={{ marginTop: 48, alignItems: "center" }}>
          <ActivityIndicator size="large" color={tokens.colors.accent} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={{ fontFamily: tokens.typography.regular, color: tokens.colors.muted }}>{i18n.t("ordersEmpty")}</Text>}
          contentContainerStyle={{ gap: tokens.spacing.md }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })}
              style={{
                backgroundColor: tokens.colors.panel,
                borderRadius: tokens.radius.lg,
                padding: tokens.spacing.lg,
                borderWidth: 1,
                borderColor: tokens.colors.border,
                gap: tokens.spacing.xs,
              }}
            >
              <Text style={{ fontFamily: tokens.typography.bold, fontSize: 18, color: tokens.colors.text }}>{item.id}</Text>
              <Text style={{ fontFamily: tokens.typography.medium, color: tokens.colors.text }}>{statusLabel(item.status)}</Text>
              <Text style={{ fontFamily: tokens.typography.regular, color: tokens.colors.muted }}>{item.address}</Text>
              <Text style={{ fontFamily: tokens.typography.regular, color: tokens.colors.text }}>{i18n.t("total")}: {item.total} RON</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

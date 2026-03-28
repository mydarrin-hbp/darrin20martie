import { useState } from "react";
import { Alert, ScrollView, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { i18n } from "../i18n";
import { sendLocalNotification } from "../services/notifications";
import { useCartStore } from "../store/cartStore";
import { useOrderStore } from "../store/orderStore";
import { tokens } from "../theme/tokens";

export function CheckoutScreen({ navigation }: { navigation: any }) {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const placeOrder = useOrderStore((state) => state.placeOrder);
  const [address, setAddress] = useState("");
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);

  const handleConfirm = async () => {
    const createdOrder = placeOrder({ items, address: address || i18n.t("addressPlaceholder") });
    await sendLocalNotification("My Darrin Partner", `${i18n.t("newOrderTitle")}: ${createdOrder.id}`);
    Alert.alert("My Darrin Partner", i18n.t("orderConfirmed"));
    clearCart();
    navigation.navigate("OrderDetail", { orderId: createdOrder.id, localOrder: createdOrder });
  };

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
        <Text style={{ fontFamily: tokens.typography.bold, fontSize: 28, color: tokens.colors.text }}>{i18n.t("checkoutTitle")}</Text>
        {items.map((item) => (
          <View key={item.serviceId} style={{ gap: 4 }}>
            <Text style={{ fontFamily: tokens.typography.bold, color: tokens.colors.text }}>{item.name}</Text>
            <Text style={{ fontFamily: tokens.typography.regular, color: tokens.colors.muted }}>
              {i18n.t(item.level)} - {item.price} RON
            </Text>
          </View>
        ))}

        <Text style={{ fontFamily: tokens.typography.medium, color: tokens.colors.text }}>{i18n.t("serviceAddress")}</Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder={i18n.t("addressPlaceholder")}
          style={{
            backgroundColor: tokens.colors.white,
            borderWidth: 1,
            borderColor: tokens.colors.border,
            borderRadius: tokens.radius.md,
            paddingHorizontal: tokens.spacing.md,
            paddingVertical: 14,
            fontFamily: tokens.typography.regular,
            color: tokens.colors.text,
          }}
        />

        <View
          style={{
            backgroundColor: tokens.colors.sand,
            borderRadius: tokens.radius.md,
            padding: tokens.spacing.md,
            gap: 4,
          }}
        >
          <Text style={{ fontFamily: tokens.typography.medium, color: tokens.colors.text }}>{i18n.t("paymentDemo")}</Text>
          <Text style={{ fontFamily: tokens.typography.regular, color: tokens.colors.muted }}>
            {i18n.t("subtotal")}: {subtotal} RON
          </Text>
        </View>

        <PrimaryButton label={i18n.t("confirmOrder")} onPress={handleConfirm} />
      </View>
    </ScrollView>
  );
}

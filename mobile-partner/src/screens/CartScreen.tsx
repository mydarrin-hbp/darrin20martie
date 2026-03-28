import { ScrollView, Text, View, Pressable } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { i18n } from "../i18n";
import { ServiceLevel, getLevelPrice, useCartStore } from "../store/cartStore";
import { tokens } from "../theme/tokens";

const LEVELS: ServiceLevel[] = ["bronze", "silver", "gold", "platinum"];

export function CartScreen({ navigation }: { navigation: any }) {
  const items = useCartStore((state) => state.items);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateLevel = useCartStore((state) => state.updateLevel);
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: tokens.colors.background }} contentContainerStyle={{ padding: tokens.spacing.lg }}>
      <View style={{ marginTop: 48, gap: tokens.spacing.md }}>
        <Text style={{ fontFamily: tokens.typography.bold, fontSize: 28, color: tokens.colors.text }}>{i18n.t("cartTitle")}</Text>

        {items.length === 0 ? (
          <View
            style={{
              backgroundColor: tokens.colors.panel,
              borderRadius: tokens.radius.lg,
              padding: tokens.spacing.xl,
              borderWidth: 1,
              borderColor: tokens.colors.border,
              gap: tokens.spacing.md,
            }}
          >
            <Text style={{ fontFamily: tokens.typography.regular, color: tokens.colors.muted }}>{i18n.t("cartEmpty")}</Text>
            <PrimaryButton label={i18n.t("backToCatalog")} onPress={() => navigation.navigate("Catalog")} />
          </View>
        ) : (
          <>
            {items.map((item) => (
              <View
                key={item.serviceId}
                style={{
                  backgroundColor: tokens.colors.panel,
                  borderRadius: tokens.radius.lg,
                  padding: tokens.spacing.lg,
                  borderWidth: 1,
                  borderColor: tokens.colors.border,
                  gap: tokens.spacing.sm,
                }}
              >
                <Text style={{ fontFamily: tokens.typography.bold, fontSize: 20, color: tokens.colors.text }}>{item.name}</Text>
                <Text style={{ fontFamily: tokens.typography.regular, color: tokens.colors.muted }}>{item.description || i18n.t("serviceDetails")}</Text>
                <Text style={{ fontFamily: tokens.typography.medium, color: tokens.colors.text }}>{i18n.t("selectLevel")}</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {LEVELS.map((level) => (
                    <Pressable
                      key={level}
                      onPress={() => updateLevel(item.serviceId, level)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: tokens.radius.sm,
                        borderWidth: 1,
                        borderColor: item.level === level ? tokens.colors.accent : tokens.colors.border,
                        backgroundColor: item.level === level ? tokens.colors.sand : tokens.colors.white,
                      }}
                    >
                      <Text style={{ fontFamily: tokens.typography.medium, color: tokens.colors.text }}>
                        {i18n.t(level)} - {getLevelPrice(level)} RON
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={{ fontFamily: tokens.typography.bold, color: tokens.colors.text }}>{item.price} RON</Text>
                <PrimaryButton label={i18n.t("remove")} onPress={() => removeFromCart(item.serviceId)} />
              </View>
            ))}

            <View
              style={{
                backgroundColor: tokens.colors.sand,
                borderRadius: tokens.radius.lg,
                padding: tokens.spacing.lg,
                gap: tokens.spacing.md,
              }}
            >
              <Text style={{ fontFamily: tokens.typography.bold, fontSize: 20, color: tokens.colors.text }}>
                {i18n.t("subtotal")}: {subtotal} RON
              </Text>
              <PrimaryButton label={i18n.t("checkout")} onPress={() => navigation.navigate("Checkout")} />
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

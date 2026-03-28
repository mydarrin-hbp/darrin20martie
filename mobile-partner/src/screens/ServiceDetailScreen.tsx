import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useEffect, useState } from "react";

import { PrimaryButton } from "../components/PrimaryButton";
import { i18n } from "../i18n";
import { CatalogService, getServiceById } from "../services/api";
import { ServiceLevel, useCartStore } from "../store/cartStore";
import { tokens } from "../theme/tokens";

const LEVELS = [
  { key: "bronze", description: "Esential, rapid si eficient." },
  { key: "silver", description: "Echilibru bun intre timp si calitate." },
  { key: "gold", description: "Executie extinsa cu materiale mai bune." },
  { key: "platinum", description: "Pachet premium, complet si prioritar." },
] as const;

export function ServiceDetailScreen({ route, navigation }: { route: any; navigation: any }) {
  const { serviceId } = route.params;
  const [service, setService] = useState<CatalogService | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<ServiceLevel>("silver");
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    getServiceById(serviceId).then(setService);
  }, [serviceId]);

  const handleAddToCart = () => {
    if (!service) {
      return;
    }
    addToCart(service, selectedLevel);
    Alert.alert("My Darrin Partner", i18n.t("cartSoon"));
    navigation.navigate("Cart");
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
        <Text style={{ fontFamily: tokens.typography.bold, fontSize: 28, color: tokens.colors.text }}>
          {service?.name ?? i18n.t("serviceDetails")}
        </Text>
        <Text style={{ fontFamily: tokens.typography.regular, color: tokens.colors.muted }}>
          {service?.description || service?.slug || i18n.t("serviceDetails")}
        </Text>

        <Text style={{ fontFamily: tokens.typography.medium, color: tokens.colors.text }}>{i18n.t("levelIntro")}</Text>

        {LEVELS.map((level) => (
          <Pressable
            key={level.key}
            onPress={() => setSelectedLevel(level.key)}
            style={{
              backgroundColor: selectedLevel === level.key ? tokens.colors.sand : tokens.colors.panel,
              borderRadius: tokens.radius.md,
              padding: tokens.spacing.md,
              gap: 4,
              borderWidth: 1,
              borderColor: selectedLevel === level.key ? tokens.colors.accent : tokens.colors.border,
            }}
          >
            <Text style={{ fontFamily: tokens.typography.bold, color: tokens.colors.text }}>{i18n.t(level.key)}</Text>
            <Text style={{ fontFamily: tokens.typography.regular, color: tokens.colors.muted }}>{level.description}</Text>
          </Pressable>
        ))}

        <PrimaryButton label={i18n.t("addToCart")} onPress={handleAddToCart} />
      </View>
    </ScrollView>
  );
}

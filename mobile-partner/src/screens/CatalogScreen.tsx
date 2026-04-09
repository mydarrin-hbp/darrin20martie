import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";

import { i18n } from "../i18n";
import { CatalogService, getServices } from "../services/api";
import { tokens } from "../theme/tokens";

export function CatalogScreen({ navigation }: { navigation: any }) {
  const [services, setServices] = useState<CatalogService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServices()
      .then(setServices)
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: tokens.colors.background, padding: tokens.spacing.lg }}>
      <Text style={{ marginTop: 48, marginBottom: tokens.spacing.lg, fontFamily: tokens.typography.bold, fontSize: 28, color: tokens.colors.text }}>
        {i18n.t("catalogTitle")}
      </Text>

      {loading ? (
        <View style={{ marginTop: 48, alignItems: "center" }}>
          <ActivityIndicator size="large" color={tokens.colors.accent} />
          <Text style={{ marginTop: tokens.spacing.sm, fontFamily: tokens.typography.regular, color: tokens.colors.muted }}>
            {i18n.t("catalogLoading")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={
            <Text style={{ fontFamily: tokens.typography.regular, color: tokens.colors.muted }}>{i18n.t("catalogEmpty")}</Text>
          }
          contentContainerStyle={{ gap: tokens.spacing.md }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate("ServiceDetail", { serviceId: item.id })}
              style={{
                backgroundColor: tokens.colors.panel,
                borderRadius: tokens.radius.lg,
                padding: tokens.spacing.lg,
                borderWidth: 1,
                borderColor: tokens.colors.border,
                gap: tokens.spacing.xs,
              }}
            >
              <Text style={{ fontFamily: tokens.typography.bold, fontSize: 20, color: tokens.colors.text }}>{item.name}</Text>
              <Text style={{ fontFamily: tokens.typography.regular, color: tokens.colors.muted }}>
                {item.description || item.slug || i18n.t("serviceDetails")}
              </Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

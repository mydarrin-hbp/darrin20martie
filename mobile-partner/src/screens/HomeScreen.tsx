import { Text, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { i18n } from "../i18n";
import { appConfig } from "../services/config";
import { useAuthStore } from "../store/authStore";
import { tokens } from "../theme/tokens";

export function HomeScreen({ navigation }: { navigation: any }) {
  const email = useAuthStore((state) => state.email);
  const logout = useAuthStore((state) => state.logout);

  return (
    <View style={{ flex: 1, backgroundColor: tokens.colors.background, padding: tokens.spacing.lg }}>
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
        <Text style={{ fontFamily: tokens.typography.bold, fontSize: 28, color: tokens.colors.text }}>{i18n.t("homeTitle")}</Text>
        <Text style={{ fontFamily: tokens.typography.regular, color: tokens.colors.muted }}>{email}</Text>
        <Text style={{ fontFamily: tokens.typography.regular, color: tokens.colors.text }}>{i18n.t("orders")}</Text>
        <Text style={{ fontFamily: tokens.typography.regular, color: tokens.colors.muted }}>
          {i18n.t("backendUrl")}: {appConfig.apiBaseUrl}
        </Text>
        <PrimaryButton label={i18n.t("openCatalog")} onPress={() => navigation.navigate("Catalog")} />
        <PrimaryButton label={i18n.t("cartOpen")} onPress={() => navigation.navigate("Cart")} />
        <PrimaryButton label={i18n.t("myOrders")} onPress={() => navigation.navigate("Orders")} />
        <PrimaryButton label={i18n.t("profile")} onPress={() => navigation.navigate("Profile")} />
        <PrimaryButton label={i18n.t("logout")} onPress={() => void logout()} />
      </View>
    </View>
  );
}

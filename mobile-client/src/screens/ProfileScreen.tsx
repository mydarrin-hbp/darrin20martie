import Constants from "expo-constants";
import { useState } from "react";
import { Alert, Switch, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { i18n } from "../i18n";
import { useAuthStore } from "../store/authStore";
import { tokens } from "../theme/tokens";

export function ProfileScreen() {
  const email = useAuthStore((state) => state.email);
  const biometricEnabled = useAuthStore((state) => state.biometricEnabled);
  const toggleBiometrics = useAuthStore((state) => state.toggleBiometrics);
  const logout = useAuthStore((state) => state.logout);
  const [profileEmail, setProfileEmail] = useState(email);

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
        <Text style={{ fontFamily: tokens.typography.bold, fontSize: 28, color: tokens.colors.text }}>{i18n.t("profileTitle")}</Text>
        <TextInput
          value={profileEmail}
          onChangeText={setProfileEmail}
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
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontFamily: tokens.typography.medium, color: tokens.colors.text }}>{i18n.t("biometricsEnabled")}</Text>
          <Switch value={biometricEnabled} onValueChange={(value) => void toggleBiometrics(value)} trackColor={{ true: tokens.colors.accent }} />
        </View>
        <Text style={{ fontFamily: tokens.typography.regular, color: tokens.colors.muted }}>
          {i18n.t("appVersion")}: {Constants.expoConfig?.version ?? "0.1.0"}
        </Text>
        <Text style={{ fontFamily: tokens.typography.regular, color: tokens.colors.muted }}>{i18n.t("notificationsReady")}</Text>
        <PrimaryButton label={i18n.t("saveProfile")} onPress={() => Alert.alert("My Darrin", i18n.t("profileUpdated"))} />
        <PrimaryButton label={i18n.t("logout")} onPress={() => void logout()} />
      </View>
    </View>
  );
}

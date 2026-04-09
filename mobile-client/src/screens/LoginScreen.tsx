import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Text, TextInput, View } from "react-native";

import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { PrimaryButton } from "../components/PrimaryButton";
import { i18n } from "../i18n";
import { appConfig } from "../services/config";
import { useAuthStore } from "../store/authStore";
import { tokens } from "../theme/tokens";

export function LoginScreen({ navigation }: { navigation: any }) {
  const requestOtp = useAuthStore((state) => state.requestOtp);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleContinue = async () => {
    if (!email || !password) {
      Alert.alert("My Darrin", "Email si parola sunt obligatorii.");
      return;
    }

    await requestOtp(email, password);
    navigation.navigate("Otp");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{
        flex: 1,
        backgroundColor: tokens.colors.background,
        padding: tokens.spacing.lg,
        justifyContent: "center",
      }}
    >
      <View
        style={{
          backgroundColor: tokens.colors.panel,
          borderRadius: tokens.radius.lg,
          padding: tokens.spacing.xl,
          gap: tokens.spacing.md,
          borderWidth: 1,
          borderColor: tokens.colors.border,
        }}
      >
        <LanguageSwitcher />
        <Text style={{ fontFamily: tokens.typography.bold, fontSize: 28, color: tokens.colors.text }}>{i18n.t("appName")}</Text>
        <Text style={{ fontFamily: tokens.typography.regular, fontSize: 16, color: tokens.colors.muted }}>{i18n.t("welcome")}</Text>

        <View style={{ gap: tokens.spacing.xs }}>
          <Text style={{ fontFamily: tokens.typography.medium, color: tokens.colors.text }}>{i18n.t("email")}</Text>
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
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
        </View>

        <View style={{ gap: tokens.spacing.xs }}>
          <Text style={{ fontFamily: tokens.typography.medium, color: tokens.colors.text }}>{i18n.t("password")}</Text>
          <TextInput
            secureTextEntry
            value={password}
            onChangeText={setPassword}
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
        </View>

        <View
          style={{
            backgroundColor: tokens.colors.sand,
            borderRadius: tokens.radius.md,
            padding: tokens.spacing.md,
            gap: 4,
          }}
        >
          <Text style={{ fontFamily: tokens.typography.medium, color: tokens.colors.text }}>{i18n.t("backendUrl")}</Text>
          <Text style={{ fontFamily: tokens.typography.regular, color: tokens.colors.muted }}>{appConfig.apiBaseUrl}</Text>
        </View>

        <PrimaryButton label={i18n.t("sendOtp")} onPress={handleContinue} />
      </View>
    </KeyboardAvoidingView>
  );
}

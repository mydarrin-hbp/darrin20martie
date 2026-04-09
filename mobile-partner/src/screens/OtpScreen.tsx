import { useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { i18n } from "../i18n";
import { useAuthStore } from "../store/authStore";
import { tokens } from "../theme/tokens";

export function OtpScreen({ navigation }: { navigation: any }) {
  const verifyOtp = useAuthStore((state) => state.verifyOtp);
  const [otp, setOtp] = useState("123456");

  const handleVerify = async () => {
    const ok = await verifyOtp(otp);
    if (!ok) {
      Alert.alert("My Darrin Partner", "Cod OTP invalid.");
      return;
    }
    navigation.navigate("Biometric");
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: tokens.colors.background,
        justifyContent: "center",
        padding: tokens.spacing.lg,
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
        <Text style={{ fontFamily: tokens.typography.bold, fontSize: 26, color: tokens.colors.text }}>{i18n.t("otp")}</Text>
        <Text style={{ fontFamily: tokens.typography.regular, color: tokens.colors.muted }}>{i18n.t("otpHint")}</Text>
        <TextInput
          keyboardType="number-pad"
          value={otp}
          onChangeText={setOtp}
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
        <PrimaryButton label={i18n.t("verifyOtp")} onPress={handleVerify} />
      </View>
    </View>
  );
}

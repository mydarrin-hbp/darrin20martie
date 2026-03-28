import { Text, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { i18n } from "../i18n";
import { useAuthStore } from "../store/authStore";
import { tokens } from "../theme/tokens";

export function BiometricScreen({ navigation }: { navigation: any }) {
  const enableBiometrics = useAuthStore((state) => state.enableBiometrics);

  const handleEnable = async () => {
    await enableBiometrics();
    navigation.reset({ index: 0, routes: [{ name: "Home" }] });
  };

  const handleSkip = () => {
    navigation.reset({ index: 0, routes: [{ name: "Home" }] });
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
        <Text style={{ fontFamily: tokens.typography.bold, fontSize: 26, color: tokens.colors.text }}>{i18n.t("biometricTitle")}</Text>
        <Text style={{ fontFamily: tokens.typography.regular, color: tokens.colors.muted }}>{i18n.t("biometricBody")}</Text>
        <PrimaryButton label={i18n.t("enableBiometrics")} onPress={handleEnable} />
        <PrimaryButton label={i18n.t("skip")} onPress={handleSkip} />
      </View>
    </View>
  );
}

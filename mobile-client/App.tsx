import { useEffect, useState } from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useFonts, SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_700Bold } from "@expo-google-fonts/space-grotesk";

import { initI18n } from "./src/i18n";
import { PrimaryButton } from "./src/components/PrimaryButton";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { appConfig } from "./src/services/config";
import { tokens } from "./src/theme/tokens";

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: tokens.colors.background,
    primary: tokens.colors.accent,
    text: tokens.colors.text,
    card: tokens.colors.panel,
    border: tokens.colors.border,
  },
};

export default function App() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
  });
  const [gateUnlocked, setGateUnlocked] = useState(false);
  const [gateUser, setGateUser] = useState(appConfig.previewGateUsername);
  const [gatePassword, setGatePassword] = useState(appConfig.previewGatePassword);
  const [gateError, setGateError] = useState("");

  useEffect(() => {
    initI18n();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: tokens.colors.background }}>
        <ActivityIndicator size="large" color={tokens.colors.accent} />
      </View>
    );
  }

  if (!gateUnlocked) {
    return (
      <View style={{ flex: 1, justifyContent: "center", padding: tokens.spacing.lg, backgroundColor: tokens.colors.background }}>
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
          <Text style={{ fontFamily: tokens.typography.bold, fontSize: 28, color: tokens.colors.text }}>Security Gate</Text>
          <Text style={{ fontFamily: tokens.typography.regular, color: tokens.colors.muted }}>
            Aplicatia este protejata cu parola pana la deploy-ul final pe Google Platform.
          </Text>
          <TextInput
            value={gateUser}
            onChangeText={setGateUser}
            style={{ backgroundColor: tokens.colors.white, borderWidth: 1, borderColor: tokens.colors.border, borderRadius: tokens.radius.md, paddingHorizontal: tokens.spacing.md, paddingVertical: 14 }}
            placeholder="Username"
          />
          <TextInput
            value={gatePassword}
            onChangeText={setGatePassword}
            secureTextEntry
            style={{ backgroundColor: tokens.colors.white, borderWidth: 1, borderColor: tokens.colors.border, borderRadius: tokens.radius.md, paddingHorizontal: tokens.spacing.md, paddingVertical: 14 }}
            placeholder="Parola"
          />
          {gateError ? <Text style={{ fontFamily: tokens.typography.regular, color: tokens.colors.danger }}>{gateError}</Text> : null}
          <PrimaryButton
            label="Deblocheaza preview"
            onPress={() => {
              if (gateUser === appConfig.previewGateUsername && gatePassword === appConfig.previewGatePassword) {
                setGateUnlocked(true);
                setGateError("");
                return;
              }
              setGateError("Credentiale invalide pentru preview gate.");
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style="dark" />
      <RootNavigator />
    </NavigationContainer>
  );
}

import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "My Darrin Client",
  slug: "mydarrin-client",
  scheme: "mydarrin-client",
  version: "0.1.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  assetBundlePatterns: ["**/*"],
  extra: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000",
    appRole: "client",
    previewGateUsername: process.env.EXPO_PUBLIC_PREVIEW_GATE_USERNAME ?? "ownergate",
    previewGatePassword: process.env.EXPO_PUBLIC_PREVIEW_GATE_PASSWORD ?? "CHANGE_ME",
    backendGateAuthorization:
      process.env.EXPO_PUBLIC_BACKEND_GATE_AUTHORIZATION ?? "Basic CHANGE_ME",
  },
});

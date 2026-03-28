import Constants from "expo-constants";

export const appConfig = {
  apiBaseUrl:
    (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ??
    process.env.EXPO_PUBLIC_API_BASE_URL ??
    "http://127.0.0.1:8000",
  appRole: (Constants.expoConfig?.extra?.appRole as string | undefined) ?? "partner",
  previewGateUsername:
    (Constants.expoConfig?.extra?.previewGateUsername as string | undefined) ??
    process.env.EXPO_PUBLIC_PREVIEW_GATE_USERNAME ??
    "ownergate",
  previewGatePassword:
    (Constants.expoConfig?.extra?.previewGatePassword as string | undefined) ??
    process.env.EXPO_PUBLIC_PREVIEW_GATE_PASSWORD ??
    "CHANGE_ME",
  backendGateAuthorization:
    (Constants.expoConfig?.extra?.backendGateAuthorization as string | undefined) ??
    process.env.EXPO_PUBLIC_BACKEND_GATE_AUTHORIZATION ??
    "Basic CHANGE_ME",
};

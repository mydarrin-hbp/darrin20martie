import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "mydarrin_client_token";
const BIOMETRIC_KEY = "mydarrin_client_biometric";

export async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function setBiometricEnabled(enabled: boolean) {
  await SecureStore.setItemAsync(BIOMETRIC_KEY, String(enabled));
}

export async function isBiometricEnabled() {
  return (await SecureStore.getItemAsync(BIOMETRIC_KEY)) === "true";
}

export async function disableBiometric() {
  await SecureStore.setItemAsync(BIOMETRIC_KEY, "false");
}

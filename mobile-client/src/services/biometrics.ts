import * as LocalAuthentication from "expo-local-authentication";

export async function authenticateBiometric() {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  if (!hasHardware || !enrolled) {
    return false;
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "My Darrin",
    fallbackLabel: "Use passcode",
    cancelLabel: "Cancel",
  });

  return result.success;
}

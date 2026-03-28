import { create } from "zustand";

import { loginRequest } from "../services/api";
import { authenticateBiometric } from "../services/biometrics";
import { clearToken, disableBiometric, getToken, isBiometricEnabled, saveToken, setBiometricEnabled } from "../services/storage";

type PendingCredentials = {
  email: string;
  password: string;
};

type AuthState = {
  token: string | null;
  email: string;
  locale: "ro" | "en";
  biometricEnabled: boolean;
  pending: PendingCredentials | null;
  otpCode: string | null;
  requestOtp: (email: string, password: string) => Promise<void>;
  verifyOtp: (inputCode: string) => Promise<boolean>;
  restoreSession: () => Promise<boolean>;
  enableBiometrics: () => Promise<void>;
  toggleBiometrics: (enabled: boolean) => Promise<void>;
  logout: () => Promise<void>;
  setLocale: (locale: "ro" | "en") => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  email: "",
  locale: "ro",
  biometricEnabled: false,
  pending: null,
  otpCode: null,
  requestOtp: async (email, password) => {
    set({ pending: { email, password }, email, otpCode: "123456" });
  },
  verifyOtp: async (inputCode) => {
    const { otpCode, pending } = get();
    if (!pending || otpCode !== inputCode) {
      return false;
    }
    const response = await loginRequest(pending.email, pending.password);
    await saveToken(response.access_token);
    set({ token: response.access_token, email: response.email, pending: null, otpCode: null });
    return true;
  },
  restoreSession: async () => {
    const token = await getToken();
    const biometricsEnabled = await isBiometricEnabled();
    if (!token) {
      return false;
    }
    if (biometricsEnabled) {
      const ok = await authenticateBiometric();
      if (!ok) {
        return false;
      }
    }
    set({ token, biometricEnabled: biometricsEnabled });
    return true;
  },
  enableBiometrics: async () => {
    const ok = await authenticateBiometric();
    if (ok) {
      await setBiometricEnabled(true);
      set({ biometricEnabled: true });
    }
  },
  toggleBiometrics: async (enabled) => {
    if (enabled) {
      const ok = await authenticateBiometric();
      if (ok) {
        await setBiometricEnabled(true);
        set({ biometricEnabled: true });
      }
      return;
    }

    await disableBiometric();
    set({ biometricEnabled: false });
  },
  logout: async () => {
    await clearToken();
    set({ token: null, pending: null, otpCode: null });
  },
  setLocale: (locale) => set({ locale }),
}));

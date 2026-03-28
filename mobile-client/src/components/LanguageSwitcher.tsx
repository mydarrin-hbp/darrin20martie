import { Pressable, Text, View } from "react-native";

import { setLocale } from "../i18n";
import { useAuthStore } from "../store/authStore";
import { tokens } from "../theme/tokens";

export function LanguageSwitcher() {
  const locale = useAuthStore((state) => state.locale);
  const setStoreLocale = useAuthStore((state) => state.setLocale);

  const applyLocale = (value: "ro" | "en") => {
    setLocale(value);
    setStoreLocale(value);
  };

  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      {(["ro", "en"] as const).map((item) => (
        <Pressable
          key={item}
          onPress={() => applyLocale(item)}
          style={{
            borderWidth: 1,
            borderColor: tokens.colors.border,
            backgroundColor: locale === item ? tokens.colors.sand : tokens.colors.panel,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: tokens.radius.sm,
          }}
        >
          <Text style={{ fontFamily: tokens.typography.medium, color: tokens.colors.text }}>{item.toUpperCase()}</Text>
        </Pressable>
      ))}
    </View>
  );
}

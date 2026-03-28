import { Pressable, Text } from "react-native";

import { tokens } from "../theme/tokens";

export function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: tokens.colors.accent,
        paddingVertical: 14,
        borderRadius: tokens.radius.md,
        alignItems: "center",
      }}
    >
      <Text style={{ color: tokens.colors.white, fontFamily: tokens.typography.bold }}>{label}</Text>
    </Pressable>
  );
}

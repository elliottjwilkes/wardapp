import { Pressable, Text, ViewStyle } from "react-native";
import { theme } from "../../lib/theme";

type ButtonProps = {
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
};

export function Button({ label, onPress, style, disabled }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.md,
          paddingVertical: 16,
          alignItems: "center",
          borderWidth: 1,
          borderColor: theme.colors.border,
          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 16,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

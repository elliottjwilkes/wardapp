import { Text, type TextStyle } from "react-native";
import { theme } from "../../lib/theme";

type TypographyProps = {
  children: React.ReactNode;
  style?: TextStyle;
};

export function Title({ children, style }: TypographyProps) {
  return (
    <Text
      style={[
        {
          fontSize: 28,
          fontWeight: "800",
          color: theme.colors.text,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Body({ children, style }: TypographyProps) {
  return (
    <Text
      style={[
        {
          fontSize: 16,
          lineHeight: 24,
          color: theme.colors.textSecondary,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Caption({ children, style }: TypographyProps) {
  return (
    <Text
      style={[
        {
          fontSize: 13,
          lineHeight: 18,
          color: theme.colors.textTertiary,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

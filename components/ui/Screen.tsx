import { View, type ViewProps } from "react-native";
import { theme } from "../../lib/theme.ts";

type ScreenProps = ViewProps & {
  padded?: boolean;
};

export function Screen({ style, padded = true, ...props }: ScreenProps) {
  return (
    <View
      style={[
        { flex: 1, backgroundColor: theme.colors.bg },
        padded && { padding: theme.spacing.lg },
        style,
      ]}
      {...props}
    />
  );
}

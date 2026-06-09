import { spacing, typography } from "@/constants";
import { useTheme } from "@/context/theme";
import { type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ActionRowProps = {
  icon: ReactNode;
  label: string;
  labelColor?: string;
  onPress?: () => void;
};

const ActionRow = ({ icon, label, labelColor, onPress }: ActionRowProps) => {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
    >
      <View style={styles.iconWrap}>{icon}</View>
      <Text
        style={[styles.label, { color: labelColor ?? colors.onSurface }]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

export default ActionRow;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 52,
  },
  iconWrap: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    ...typography.bodyLg,
  },
});

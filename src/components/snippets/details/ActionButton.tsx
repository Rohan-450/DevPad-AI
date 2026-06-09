import { radius, spacing, typography } from "@/constants";
import { useTheme } from "@/context/theme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text } from "react-native";

const ActionButton = ({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) => {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionBtn,
        {
          borderColor: colors.outlineVariant,
          backgroundColor: colors.surfaceContainer,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Ionicons name={icon} size={16} color={colors.onSurface} />
      <Text style={[styles.actionLabel, { color: colors.onSurface }]}>
        {label}
      </Text>
    </Pressable>
  );
};

export default ActionButton;

const styles = StyleSheet.create({
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  actionLabel: {
    ...typography.labelCaps,
  },
});

import { radius, spacing, typography } from "@/constants";
import { useTheme } from "@/context/theme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type TagChipProps = {
  label: string;
  onRemove?: () => void;
};

const TagChip = ({ label, onRemove }: TagChipProps) => {
  const { colors } = useTheme();
  return (
    <View
      style={[styles.chip, { backgroundColor: colors.surfaceContainerHigh }]}
    >
      <Text style={[styles.text, { color: colors.onSurfaceVariant }]}>
        #{label}
      </Text>
      {onRemove ? (
        <Pressable hitSlop={6} onPress={onRemove}>
          <Ionicons name="close" size={14} color={colors.onSurfaceVariant} />
        </Pressable>
      ) : null}
    </View>
  );
};

export default TagChip;

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  text: {
    ...typography.badge,
  },
});

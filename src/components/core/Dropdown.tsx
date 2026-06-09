import { radius, spacing, typography } from "@/constants";
import { useTheme } from "@/context/theme";
import { Ionicons } from "@expo/vector-icons";
import { type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type DropdownProps = {
  icon?: ReactNode;
  label: string;
  value: string;
  valueColor?: string;
  valueAsChip?: boolean;
  layout?: "inline" | "stacked";
  onPress?: () => void;
};

const Dropdown = ({
  icon,
  label,
  value,
  valueColor,
  valueAsChip = false,
  layout = "inline",
  onPress,
}: DropdownProps) => {
  const { colors } = useTheme();

  const renderInlineValue = () => {
    if (valueAsChip) {
      const tint = valueColor ?? colors.tertiaryFixedDim;
      return (
        <View style={[styles.chip, { borderColor: tint }]}>
          <Text style={[styles.chipText, { color: tint }]}>{value}</Text>
        </View>
      );
    }
    return (
      <Text
        style={[
          styles.value,
          { color: valueColor ?? colors.onSurfaceVariant },
        ]}
      >
        {value}
      </Text>
    );
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
    >
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}

      {layout === "stacked" ? (
        <View style={styles.stackedBody}>
          <Text style={[styles.label, { color: colors.onSurface }]}>
            {label}
          </Text>
          <Text style={[styles.stackedValue, { color: colors.onSurfaceVariant }]}>
            {value}
          </Text>
        </View>
      ) : (
        <>
          <Text style={[styles.label, { color: colors.onSurface }]}>
            {label}
          </Text>
          <View style={styles.spacer} />
          {renderInlineValue()}
        </>
      )}

      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.onSurfaceVariant}
      />
    </Pressable>
  );
};

export default Dropdown;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
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
  value: {
    ...typography.bodyMd,
  },
  spacer: {
    flex: 1,
  },
  stackedBody: {
    flex: 1,
  },
  stackedValue: {
    ...typography.bodyMd,
    marginTop: 2,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  chipText: {
    ...typography.bodyMd,
  },
});

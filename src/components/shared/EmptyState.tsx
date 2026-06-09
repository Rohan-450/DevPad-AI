import { radius, spacing, typography } from "@/constants";
import { useTheme } from "@/context/theme";
import { Ionicons } from "@expo/vector-icons";
import { type ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type EmptyStateProps = {
  icon?: IoniconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

const EmptyState = ({
  icon = "documents-outline",
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: colors.surfaceContainer,
            borderColor: colors.outlineVariant,
          },
        ]}
      >
        <Ionicons name={icon} size={32} color={colors.primary} />
      </View>

      <Text style={[styles.title, { color: colors.onSurface }]}>{title}</Text>

      {description ? (
        <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>
          {description}
        </Text>
      ) : null}

      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => [
            styles.action,
            {
              backgroundColor: colors.primaryContainer,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text style={[styles.actionText, { color: colors.onPrimaryContainer }]}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};

export default EmptyState;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.headlineMd,
    textAlign: "center",
  },
  description: {
    ...typography.bodyMd,
    textAlign: "center",
    maxWidth: 280,
  },
  action: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  actionText: {
    ...typography.bodyLg,
  },
});

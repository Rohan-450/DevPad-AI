import { radius, spacing, typography } from "@/constants";
import { useTheme } from "@/context/theme";
import { relativeTime } from "@/lib/format";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  generation: AiGeneration;
  onReadMore: () => void;
};

const LatestResponseCard = ({ generation, onReadMore }: Props) => {
  const { colors } = useTheme();
  const isExplain = generation.kind === "explain";
  const summary = generation.content.summary;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surfaceContainer,
          borderColor: colors.outlineVariant,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Ionicons name="sparkles" size={16} color={colors.warning} />
        <View
          style={[
            styles.kindBadge,
            { borderColor: isExplain ? colors.primary : colors.tertiaryFixed },
          ]}
        >
          <Text
            style={[
              styles.kindText,
              { color: isExplain ? colors.primary : colors.tertiaryFixed },
            ]}
          >
            {isExplain ? "EXPLAIN" : "IMPROVE"}
          </Text>
        </View>
        <View style={styles.spacer} />
        <Text style={[styles.timeText, { color: colors.onSurfaceVariant }]}>
          {relativeTime(generation.createdAt)}
        </Text>
      </View>

      <Text
        style={[styles.summary, { color: colors.onSurface }]}
        numberOfLines={3}
      >
        {summary}
      </Text>

      <Pressable
        hitSlop={8}
        onPress={onReadMore}
        style={({ pressed }) => [styles.readMore, { opacity: pressed ? 0.7 : 1 }]}
      >
        <Text style={[styles.readMoreText, { color: colors.primary }]}>
          Read more
        </Text>
        <Ionicons name="chevron-forward" size={16} color={colors.primary} />
      </Pressable>
    </View>
  );
};

export default LatestResponseCard;

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  spacer: {
    flex: 1,
  },
  kindBadge: {
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  kindText: {
    ...typography.badge,
  },
  timeText: {
    ...typography.labelCaps,
  },
  summary: {
    ...typography.bodyLg,
  },
  readMore: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 2,
  },
  readMoreText: {
    ...typography.labelCaps,
    fontSize: 12,
  },
});

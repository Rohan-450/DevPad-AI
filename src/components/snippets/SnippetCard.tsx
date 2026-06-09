import CodeEditor from "@/components/core/CodeEditor";
import LanguageBadge from "@/components/snippets/LanguageBadge";
import TagChip from "@/components/snippets/TagChip";
import { radius, spacing, typography } from "@/constants";
import { useTheme } from "@/context/theme";
import { useToggleFavorite } from "@/hooks/useSnippets";
import { useSnippetTags } from "@/hooks/useTags";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

const PREVIEW_LINES = 4;

const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

type SnippetCardProps = {
  snippet: Snippet;
  onPress?: () => void;
};

const SnippetCard = ({ snippet, onPress }: SnippetCardProps) => {
  const { colors } = useTheme();
  const { mutate: toggleFavorite } = useToggleFavorite();
  const { data: tags = [] } = useSnippetTags(snippet.id);

  const preview = snippet.code.split("\n").slice(0, PREVIEW_LINES).join("\n");

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surfaceContainer,
          borderColor: colors.outlineVariant,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text
            style={[styles.title, { color: colors.onSurface }]}
            numberOfLines={1}
          >
            {snippet.title}
          </Text>
          <Pressable hitSlop={8} onPress={() => toggleFavorite(snippet.id)}>
            <Ionicons
              name={snippet.isFavorite ? "star" : "star-outline"}
              size={22}
              color={
                snippet.isFavorite ? colors.warning : colors.onSurfaceVariant
              }
            />
          </Pressable>
        </View>
        <View style={[styles.metaRow, { justifyContent: "space-between" }]}>
          <View style={styles.metaRow}>
            <LanguageBadge language={snippet.language} />
            <Text style={[styles.date, { color: colors.onSurfaceVariant }]}>
              {formatDate(snippet.updatedAt)}
            </Text>
          </View>
          <View style={styles.indicators}>
            {snippet.hasAi ? (
              <Ionicons name="sparkles" size={14} color={colors.warning} />
            ) : null}
            {snippet.hasImage ? (
              <Ionicons
                name="image-outline"
                size={14}
                color={colors.onSurfaceVariant}
              />
            ) : null}
            {snippet.hasFile ? (
              <Ionicons
                name="document-outline"
                size={14}
                color={colors.onSurfaceVariant}
              />
            ) : null}
          </View>
        </View>
      </View>

      <View
        style={[
          styles.codeWrap,
          { backgroundColor: colors.surfaceContainerLowest },
        ]}
      >
        <CodeEditor
          value={preview}
          language={snippet.language}
          mode="read"
          showLineNumbers={false}
          fontSize={13}
        />
        <LinearGradient
          colors={["transparent", colors.surfaceContainerLowest]}
          style={styles.fade}
          pointerEvents="none"
        />
      </View>

      {tags.length > 0 ? (
        <View style={styles.tagsFooter}>
          {tags.map((tag) => (
            <TagChip key={tag} label={tag} />
          ))}
        </View>
      ) : null}
    </Pressable>
  );
};

export default SnippetCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerText: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  title: {
    ...typography.headlineMd,
  },
  metaRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  indicators: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  date: {
    ...typography.labelCaps,
    textTransform: "uppercase",
  },
  codeWrap: {
    height: 104,
    overflow: "hidden",
  },
  fade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 44,
  },
  tagsFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
});

import CodeEditor from "@/components/core/CodeEditor";
import { radius, spacing, typography } from "@/constants";
import { useTheme } from "@/context/theme";
import {
  useApplyImprovement,
  useDeleteGeneration,
  useGenerationHistory,
} from "@/hooks/useAi";
import { relativeTime } from "@/lib/format";
import { useSettingsStore } from "@/store/settingsStore";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  snippet: Snippet;
  onClose: () => void;
};

const AISheet = ({ visible, snippet, onClose }: Props) => {
  const { colors } = useTheme();
  const fontSize = useSettingsStore((s) => s.fontSize);
  const { data: history = [], isLoading } = useGenerationHistory(snippet.id);
  const { mutateAsync: applyImprovement } = useApplyImprovement();
  const { mutate: removeGeneration } = useDeleteGeneration(snippet.id);

  const handleReplace = (improvedCode: string) => {
    Alert.alert(
      "Replace code?",
      "This overwrites the current snippet code.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Replace",
          style: "destructive",
          onPress: async () => {
            await applyImprovement({ snippetId: snippet.id, improvedCode });
            onClose();
          },
        },
      ],
    );
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete this generation?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => removeGeneration(id),
      },
    ]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="formSheet"
      backdropColor={"rgba(0,0,0,0.5)"}
    >
      <View
        style={[styles.sheet, { backgroundColor: colors.surfaceContainer }]}
      >
        <View style={styles.handle}>
          <View
            style={[
              styles.handleBar,
              { backgroundColor: colors.outlineVariant },
            ]}
          />
        </View>

        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons name="sparkles" size={20} color={colors.warning} />
            <Text style={[styles.title, { color: colors.onSurface }]}>
              AI Generations
            </Text>
          </View>
          <Pressable hitSlop={8} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.onSurface} />
          </Pressable>
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : history.length === 0 ? (
          <View style={styles.center}>
            <Text style={[styles.empty, { color: colors.onSurfaceVariant }]}>
              No AI generations yet. Ask AI from the snippet detail.
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          >
            {history.map((gen) => (
              <GenerationCard
                key={gen.id}
                generation={gen}
                snippetLanguage={snippet.language}
                currentCode={snippet.code}
                fontSize={fontSize}
                onReplace={handleReplace}
                onDelete={handleDelete}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

export default AISheet;

// --- One history card ----------------------------------------------------

const GenerationCard = ({
  generation,
  snippetLanguage,
  currentCode,
  fontSize,
  onReplace,
  onDelete,
}: {
  generation: AiGeneration;
  snippetLanguage: string;
  currentCode: string;
  fontSize: number;
  onReplace: (code: string) => void;
  onDelete: (id: string) => void;
}) => {
  const { colors } = useTheme();
  const isExplain = generation.kind === "explain";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surfaceContainerHigh,
          borderColor: colors.outlineVariant,
        },
      ]}
    >
      <View style={styles.cardHeader}>
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
        <Pressable
          hitSlop={8}
          onPress={() => onDelete(generation.id)}
          style={styles.deleteBtn}
        >
          <Ionicons name="trash-outline" size={18} color={colors.error} />
        </Pressable>
      </View>

      {isExplain ? (
        <ExplainBody content={generation.content as AiExplainContent} />
      ) : (
        <ImproveBody
          content={generation.content as AiImproveContent}
          snippetLanguage={snippetLanguage}
          currentCode={currentCode}
          fontSize={fontSize}
          onReplace={onReplace}
        />
      )}

      {generation.model ? (
        <Text style={[styles.modelText, { color: colors.onSurfaceVariant }]}>
          {generation.model}
        </Text>
      ) : null}
    </View>
  );
};

const ExplainBody = ({ content }: { content: AiExplainContent }) => {
  const { colors } = useTheme();
  return (
    <>
      <Text style={[styles.summary, { color: colors.onSurface }]}>
        {content.summary}
      </Text>
      <Text style={[styles.bodyText, { color: colors.onSurfaceVariant }]}>
        {content.explanation}
      </Text>
      {content.suggestions.length > 0 ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
            Suggestions
          </Text>
          {content.suggestions.map((s, i) => (
            <BulletLine key={i} text={s} />
          ))}
        </View>
      ) : null}
    </>
  );
};

const ImproveBody = ({
  content,
  snippetLanguage,
  currentCode,
  fontSize,
  onReplace,
}: {
  content: AiImproveContent;
  snippetLanguage: string;
  currentCode: string;
  fontSize: number;
  onReplace: (code: string) => void;
}) => {
  const { colors } = useTheme();
  // Hide the Replace button if the snippet already matches this suggestion —
  // either because the user already applied it, or it's a no-op.
  const alreadyApplied = content.improvedCode.trim() === currentCode.trim();
  return (
    <>
      <Text style={[styles.summary, { color: colors.onSurface }]}>
        {content.summary}
      </Text>
      {content.notes.length > 0 ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
            Changes
          </Text>
          {content.notes.map((n, i) => (
            <BulletLine key={i} text={n} />
          ))}
        </View>
      ) : null}
      <View
        style={[
          styles.codeWrap,
          {
            borderColor: colors.outlineVariant,
            backgroundColor: colors.surfaceContainerLowest,
          },
        ]}
      >
        <CodeEditor
          value={content.improvedCode}
          language={snippetLanguage}
          mode="read"
          showLineNumbers
          fontSize={fontSize}
        />
      </View>
      {alreadyApplied ? (
        <View style={styles.appliedRow}>
          <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
          <Text style={[styles.appliedText, { color: colors.primary }]}>
            Applied
          </Text>
        </View>
      ) : (
        <Pressable
          onPress={() => onReplace(content.improvedCode)}
          style={({ pressed }) => [
            styles.replaceBtn,
            {
              backgroundColor: colors.primaryContainer,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Ionicons
            name="swap-horizontal"
            size={18}
            color={colors.onPrimaryContainer}
          />
          <Text
            style={[
              styles.replaceBtnText,
              { color: colors.onPrimaryContainer },
            ]}
          >
            Replace code
          </Text>
        </Pressable>
      )}
    </>
  );
};

const BulletLine = ({ text }: { text: string }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.bullet}>
      <Text style={[styles.bulletDot, { color: colors.onSurfaceVariant }]}>
        •
      </Text>
      <Text style={[styles.bulletText, { color: colors.onSurfaceVariant }]}>
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
  },
  handle: {
    alignItems: "center",
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: radius.full,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  title: {
    ...typography.headlineMd,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  empty: {
    ...typography.bodyMd,
    textAlign: "center",
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge,
    gap: spacing.md,
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardHeader: {
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
  deleteBtn: {
    padding: spacing.xs,
  },
  summary: {
    ...typography.bodyLg,
  },
  bodyText: {
    ...typography.bodyMd,
  },
  section: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    ...typography.labelCaps,
  },
  bullet: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  bulletDot: {
    ...typography.bodyMd,
  },
  bulletText: {
    ...typography.bodyMd,
    flex: 1,
  },
  codeWrap: {
    borderWidth: 1,
    borderRadius: radius.md,
    overflow: "hidden",
    height: 220,
    marginTop: spacing.sm,
  },
  replaceBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  replaceBtnText: {
    ...typography.labelCaps,
    fontSize: 13,
  },
  appliedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  appliedText: {
    ...typography.labelCaps,
    fontSize: 13,
  },
  modelText: {
    ...typography.badge,
    marginTop: spacing.xs,
  },
});

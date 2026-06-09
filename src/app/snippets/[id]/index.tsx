import CodeEditor from "@/components/core/CodeEditor";
import PickerModal, { type PickerOption } from "@/components/core/PickerModal";
import AISheet from "@/components/snippets/AISheet";
import { type AttachmentItem } from "@/components/snippets/AttachmentBox";
import CodeViewerModal from "@/components/snippets/CodeViewerModal";
import ActionButton from "@/components/snippets/details/ActionButton";
import LanguageBadge from "@/components/snippets/LanguageBadge";
import LatestResponseCard from "@/components/snippets/LatestResponseCard";
import SnippetExtras from "@/components/snippets/SnippetExtras";
import { radius, spacing, typography } from "@/constants";
import { useTheme } from "@/context/theme";
import { useGenerationHistory } from "@/hooks/useAi";
import {
    useAddDocumentAttachment,
    useAddImageAttachment,
    useAttachments,
    useDeleteAttachment,
} from "@/hooks/useAttachments";
import {
    useDeleteSnippet,
    useSnippet,
    useToggleFavorite,
} from "@/hooks/useSnippets";
import { useSnippetTags } from "@/hooks/useTags";
import { relativeTime } from "@/lib/format";
import { extensionForLanguage } from "@/lib/language";
import { exportAndShareSnippet } from "@/services/files";
import { useSettingsStore } from "@/store/settingsStore";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SnippetDetail() {
  const { colors, isDarkMode } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const fontSize = useSettingsStore((s) => s.fontSize);

  const { data: snippet, isLoading } = useSnippet(id);
  const { data: tags = [] } = useSnippetTags(id);
  const { data: attachments = [] } = useAttachments(id);
  const { data: history = [] } = useGenerationHistory(id);
  const { mutate: toggleFavorite } = useToggleFavorite();
  const { mutateAsync: deleteSnippet } = useDeleteSnippet();
  const { mutate: addImage } = useAddImageAttachment(id);
  const { mutate: addDocument } = useAddDocumentAttachment(id);
  const { mutate: removeAttachment } = useDeleteAttachment();

  const [copied, setCopied] = useState(false);
  const [codeFullscreen, setCodeFullscreen] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showAiSheet, setShowAiSheet] = useState(false);

  const latestGeneration = history[0] ?? null;

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!snippet) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.missing, { color: colors.onSurfaceVariant }]}>
          Snippet not found.
        </Text>
      </View>
    );
  }

  const handleCopy = async () => {
    await Clipboard.setStringAsync(snippet.code);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite(snippet.id);
  };

  const handleShare = () => {
    Share.share({
      title: snippet.title,
      message: `${snippet.title} (${snippet.language})\n\n${snippet.code}`,
    });
  };

  const exportOptions: PickerOption<ExportFormat>[] = [
    { value: "txt", label: "Plain text (.txt)" },
    {
      value: "source",
      label: `Source file (.${extensionForLanguage(snippet.language)})`,
    },
    { value: "json", label: "Backup data (.json)" },
  ];

  const handleExportFormat = async (format: ExportFormat) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await exportAndShareSnippet(snippet, format);
    } catch {
      Alert.alert("Export failed", "Could not export this snippet.");
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete snippet?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await deleteSnippet(snippet.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header — no title here so the full title can show in the body */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + spacing.sm,
            backgroundColor: isDarkMode ? colors.black : colors.white,
          },
        ]}
      >
        <Pressable hitSlop={8} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
        </Pressable>
        <View style={styles.spacer} />
        <Pressable
          hitSlop={8}
          onPress={handleFavorite}
          style={styles.headerAction}
        >
          <Ionicons
            name={snippet.isFavorite ? "star" : "star-outline"}
            size={24}
            color={snippet.isFavorite ? colors.warning : colors.onSurface}
          />
        </Pressable>
        <Pressable
          hitSlop={8}
          onPress={() =>
            router.push({
              pathname: "/snippets/[id]/edit",
              params: { id: snippet.id },
            })
          }
          style={styles.headerAction}
        >
          <MaterialIcons name="edit" size={24} color={colors.onSurface} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Full title */}
        <Text style={[styles.title, { color: colors.onSurface }]}>
          {snippet.title}
        </Text>

        {/* Meta: language, updated */}
        <View style={styles.metaRow}>
          <LanguageBadge language={snippet.language} />
          <View style={styles.spacer} />
          <Text style={[styles.updated, { color: colors.onSurfaceVariant }]}>
            Updated {relativeTime(snippet.updatedAt)}
          </Text>
        </View>

        <View style={styles.metaRow}>
          {tags.length > 0 ? (
            <Text style={[styles.tags, { color: colors.onSurfaceVariant }]}>
              {tags.map((t) => `#${t}`).join(" ")}
            </Text>
          ) : null}
        </View>

        {/* Code block */}
        <View
          style={[
            styles.codeBlock,
            {
              borderColor: colors.outlineVariant,
              backgroundColor: colors.surfaceContainerLowest,
            },
          ]}
        >
          <View style={styles.codeActions}>
            <Pressable
              hitSlop={8}
              onPress={() => setCodeFullscreen(true)}
              style={[
                styles.codeActionBtn,
                { backgroundColor: colors.surfaceContainerHigh },
              ]}
            >
              <Ionicons
                name="expand-outline"
                size={18}
                color={colors.onSurfaceVariant}
              />
            </Pressable>
            <Pressable
              hitSlop={8}
              onPress={handleCopy}
              style={[
                styles.codeActionBtn,
                { backgroundColor: colors.surfaceContainerHigh },
              ]}
            >
              <Ionicons
                name={copied ? "checkmark" : "copy-outline"}
                size={18}
                color={copied ? colors.primary : colors.onSurfaceVariant}
              />
            </Pressable>
          </View>
          <CodeEditor
            value={snippet.code}
            language={snippet.language}
            mode="read"
            showLineNumbers
            fontSize={fontSize}
          />
        </View>

        {/* Latest AI response — tap "Read more" to see history in the sheet. */}
        {latestGeneration ? (
          <View style={styles.latestResponse}>
            <LatestResponseCard
              generation={latestGeneration}
              onReadMore={() => setShowAiSheet(true)}
            />
          </View>
        ) : null}

        {/* AI ask + attachments — saved instantly on the detail screen */}
        <View style={styles.extras}>
          <SnippetExtras
            snippet={snippet}
            attachments={attachments}
            onAdd={(kind) =>
              kind === "image" ? addImage("library") : addDocument()
            }
            onDelete={(item: AttachmentItem) => {
              if (item.id) removeAttachment({ id: item.id, snippetId: id });
            }}
            onGenerated={() => setShowAiSheet(true)}
          />
        </View>
      </ScrollView>

      {/* Action bar */}
      <View
        style={[
          styles.actionBar,
          {
            paddingBottom: insets.bottom + spacing.md,
            borderTopColor: colors.outlineVariant,
            backgroundColor: isDarkMode ? colors.black : colors.white,
          },
        ]}
      >
        <ActionButton
          icon="share-outline"
          label="Share"
          onPress={handleShare}
        />
        <ActionButton
          icon="download-outline"
          label="Export"
          onPress={() => setShowExport(true)}
        />
        <ActionButton
          icon="trash-outline"
          label="Delete"
          onPress={handleDelete}
        />
      </View>

      <CodeViewerModal
        visible={codeFullscreen}
        code={snippet.code}
        language={snippet.language}
        onClose={() => setCodeFullscreen(false)}
      />

      <PickerModal
        visible={showExport}
        title="Export as"
        options={exportOptions}
        selected="txt"
        onSelect={handleExportFormat}
        onClose={() => setShowExport(false)}
      />

      <AISheet
        visible={showAiSheet}
        snippet={snippet}
        onClose={() => setShowAiSheet(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  missing: {
    ...typography.bodyLg,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerAction: {
    marginLeft: spacing.lg,
  },
  spacer: {
    flex: 1,
  },

  // Body
  content: {
    padding: spacing.lg,
  },
  title: {
    ...typography.headlineLg,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tags: {
    ...typography.bodyMd,
  },
  updated: {
    ...typography.labelCaps,
  },

  // Code block
  codeBlock: {
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  latestResponse: {
    marginTop: spacing.lg,
  },
  extras: {
    marginTop: spacing.lg,
  },
  codeActions: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    zIndex: 1,
    flexDirection: "row",
    gap: spacing.sm,
  },
  codeActionBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },

  // Action bar
  actionBar: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});

import CodeEditor from "@/components/core/CodeEditor";
import Divider from "@/components/core/Divider";
import PickerModal, { PickerOption } from "@/components/core/PickerModal";
import SnippetExtras from "@/components/snippets/SnippetExtras";
import TagInput from "@/components/snippets/TagInput";
import { radius, spacing, typography } from "@/constants";
import { useTheme } from "@/context/theme";
import { LANGUAGES, getLanguage } from "@/lib/language";
import { pickDocument, pickImageFromLibrary } from "@/services/files";
import { useSettingsStore } from "@/store/settingsStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type SnippetFormValues = {
  title: string;
  code: string;
  language: string;
  isFavorite: boolean;
  tags: string[];
  attachments: DraftAttachment[];
};

type SnippetFormProps = {
  headerTitle: string;
  initialValues?: Partial<SnippetFormValues>;
  submitting?: boolean;
  onSubmit: (values: SnippetFormValues) => void;
};

const SnippetForm = ({
  headerTitle,
  initialValues,
  submitting = false,
  onSubmit,
}: SnippetFormProps) => {
  const { colors, isDarkMode } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const defaultLanguage = useSettingsStore((s) => s.defaultLanguage);
  const fontSize = useSettingsStore((s) => s.fontSize);

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [code, setCode] = useState(initialValues?.code ?? "");
  const [language, setLanguage] = useState(
    initialValues?.language ?? defaultLanguage,
  );
  const [isFavorite, setIsFavorite] = useState(
    initialValues?.isFavorite ?? false,
  );
  const [tags, setTags] = useState<string[]>(initialValues?.tags ?? []);
  const [attachments, setAttachments] = useState<DraftAttachment[]>(
    initialValues?.attachments ?? [],
  );
  const [showPicker, setShowPicker] = useState(false);

  const handleAdd = async (kind: AttachmentKind) => {
    const draft =
      kind === "image" ? await pickImageFromLibrary() : await pickDocument();
    if (draft) setAttachments((prev) => [...prev, draft]);
  };

  const handleDelete = (item: { uri: string }) =>
    setAttachments((prev) => prev.filter((a) => a.uri !== item.uri));

  const lang = getLanguage(language);
  const langName = (lang?.name ?? language).toUpperCase();
  const langColor = lang?.color ?? colors.primary;

  const languageOptions: PickerOption<string>[] = LANGUAGES.map((l) => ({
    value: l.id,
    label: l.name,
    tint: l.color,
  }));

  const handleSave = () => {
    if (submitting) return;
    onSubmit({
      title: title.trim() || "Untitled",
      code,
      language,
      isFavorite,
      tags,
      attachments,
    });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Custom header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + spacing.sm,
            backgroundColor: isDarkMode ? colors.black : colors.white,
          },
        ]}
      >
        <View style={styles.headerSide}>
          <Pressable hitSlop={8} onPress={() => router.back()}>
            <Text style={[styles.headerCancel, { color: colors.onSurface }]}>
              Cancel
            </Text>
          </Pressable>
        </View>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>
            {headerTitle}
          </Text>
        </View>
        <View style={[styles.headerSide, styles.headerRightAlign]}>
          <Pressable
            hitSlop={8}
            onPress={handleSave}
            disabled={submitting}
            style={({ pressed }) => [
              styles.saveBtn,
              {
                backgroundColor: colors.primaryContainer,
                opacity: pressed || submitting ? 0.85 : 1,
              },
            ]}
          >
            <Text
              style={[styles.saveText, { color: colors.onPrimaryContainer }]}
            >
              Save
            </Text>
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView behavior="padding" style={styles.root}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + spacing.huge },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>
            TITLE
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Explain your snippet..."
            placeholderTextColor={colors.onSurfaceVariant}
            style={[
              styles.titleInput,
              {
                borderColor: colors.outlineVariant,
                color: colors.onSurface,
                backgroundColor: colors.surface,
              },
            ]}
          />

          {/* Language + Favorite */}
          <View style={styles.languageRow}>
            <Pressable
              onPress={() => setShowPicker(true)}
              style={({ pressed }) => [
                styles.languagePicker,
                {
                  borderColor: colors.outlineVariant,
                  backgroundColor: colors.surface,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <View style={styles.langBadgeWrap}>
                <View
                  style={[styles.langDot, { backgroundColor: langColor }]}
                />
                <Text style={[styles.langBadgeText, { color: langColor }]}>
                  {langName}
                </Text>
              </View>
              <Divider orientation="vertical" style={styles.langDivider} />
              <Text
                style={[styles.langPickerLabel, { color: colors.onSurface }]}
              >
                Language Picker
              </Text>
              <Ionicons
                name="chevron-down"
                size={18}
                color={colors.onSurfaceVariant}
              />
            </Pressable>
            <Pressable
              onPress={() => setIsFavorite((v) => !v)}
              style={({ pressed }) => [
                styles.favBtn,
                {
                  borderColor: colors.outlineVariant,
                  backgroundColor: colors.surface,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Ionicons
                name={isFavorite ? "star" : "star-outline"}
                size={22}
                color={isFavorite ? colors.warning : colors.onSurface}
              />
            </Pressable>
          </View>

          {/* Code editor */}
          <View
            style={[styles.editorWrap, { borderColor: colors.outlineVariant }]}
          >
            <CodeEditor
              value={code}
              onChange={setCode}
              language={language}
              mode="edit"
              fontSize={fontSize}
              placeholder={
                "function example() {\n  console.log('Paste your code here...');\n}"
              }
            />
          </View>

          {/* Tags */}
          <Text
            style={[
              styles.label,
              styles.tagsLabel,
              { color: colors.onSurfaceVariant },
            ]}
          >
            TAGS
          </Text>
          <TagInput value={tags} onChange={setTags} />

          {/* AI + attachments — drafts saved with the snippet */}
          <View style={styles.extras}>
            <SnippetExtras
              attachments={attachments}
              onAdd={handleAdd}
              onDelete={handleDelete}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <PickerModal
        visible={showPicker}
        title="Language"
        options={languageOptions}
        selected={language}
        onSelect={setLanguage}
        onClose={() => setShowPicker(false)}
      />
    </View>
  );
};

export default SnippetForm;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerSide: {
    flex: 1,
    justifyContent: "center",
  },
  headerRightAlign: {
    alignItems: "flex-end",
  },
  headerCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  headerCancel: {
    ...typography.bodyLg,
  },
  headerTitle: {
    ...typography.headlineMd,
  },
  saveBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  saveText: {
    ...typography.bodyLg,
  },

  // Body
  content: {
    padding: spacing.lg,
  },
  label: {
    ...typography.labelCaps,
    marginBottom: spacing.sm,
  },
  tagsLabel: {
    marginTop: spacing.lg,
  },
  extras: {
    marginTop: spacing.lg,
  },
  titleInput: {
    ...typography.bodyLg,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },

  // Language row
  languageRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  languagePicker: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  langBadgeWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  langDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  langBadgeText: {
    ...typography.labelCaps,
    fontSize: 12,
  },
  langDivider: {
    marginVertical: 2,
  },
  langPickerLabel: {
    ...typography.bodyMd,
    marginRight: -1,
  },
  spacer: {
    flex: 1,
  },
  favBtn: {
    width: 52,
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },

  // Editor
  editorWrap: {
    borderWidth: 1,
    borderRadius: radius.md,
    overflow: "hidden",
    height: 300,
  },
});

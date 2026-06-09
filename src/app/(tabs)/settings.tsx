import Divider from "@/components/core/Divider";
import Dropdown from "@/components/core/Dropdown";
import PickerModal, { PickerOption } from "@/components/core/PickerModal";
import ActionRow from "@/components/settings/ActionRow";
import Card from "@/components/settings/Card";
import SectionHeader from "@/components/settings/SectionHeader";
import { radius, spacing, typography } from "@/constants";
import { useTheme } from "@/context/theme";
import {
    useApiKey,
    useClearApiKey,
    useSaveApiKey,
    useValidateApiKey,
} from "@/hooks/useAi";
import { getLanguage, LANGUAGES } from "@/lib/language";
import { FONT_SIZES, FontSize, useSettingsStore } from "@/store/settingsStore";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

const APP_VERSION = "v1.0.0";

const THEME_LABELS: Record<ThemeMode, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};

type PickerKind = "theme" | "language" | "fontSize" | null;

export default function Settings() {
  const { colors, isDarkMode } = useTheme();
  const themeMode = useSettingsStore((s) => s.themeMode);
  const defaultLanguage = useSettingsStore((s) => s.defaultLanguage);
  const fontSize = useSettingsStore((s) => s.fontSize);
  const aiModel = useSettingsStore((s) => s.aiModel);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);
  const setDefaultLanguage = useSettingsStore((s) => s.setDefaultLanguage);
  const setFontSize = useSettingsStore((s) => s.setFontSize);
  const setAiModel = useSettingsStore((s) => s.setAiModel);

  // API key state from SecureStore
  const { data: savedKey } = useApiKey();
  const { mutateAsync: saveKey } = useSaveApiKey();
  const { mutateAsync: clearKey } = useClearApiKey();
  const { mutateAsync: validateKey, isPending: validating } =
    useValidateApiKey();

  const [picker, setPicker] = useState<PickerKind>(null);
  const [keyInput, setKeyInput] = useState("");
  const [keyVisible, setKeyVisible] = useState(false);
  const [modelInput, setModelInput] = useState(aiModel);

  // Populate the input when SecureStore loads. Reacts to mount, save, clear.
  useEffect(() => {
    setKeyInput(savedKey ?? "");
  }, [savedKey]);

  useEffect(() => {
    setModelInput(aiModel);
  }, [aiModel]);

  const language = getLanguage(defaultLanguage);

  const themeOptions: PickerOption<ThemeMode>[] = [
    { value: "system", label: "System" },
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
  ];

  const languageOptions: PickerOption<string>[] = LANGUAGES.map((l) => ({
    value: l.id,
    label: l.name,
    tint: l.color,
  }));

  const fontSizeOptions: PickerOption<FontSize>[] = FONT_SIZES.map((s) => ({
    value: s,
    label: `${s}px`,
  }));

  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) setKeyInput(text.trim());
  };

  const handleValidate = async () => {
    const k = keyInput.trim();
    if (!k) {
      Alert.alert("Enter a key", "Paste your OpenRouter API key first.");
      return;
    }
    const ok = await validateKey(k);
    if (!ok) {
      Alert.alert(
        "Invalid key",
        "The OpenRouter API key didn't validate. Check it and try again.",
      );
      return;
    }
    await saveKey(k);
    Alert.alert("Key saved", "Your API key was validated and saved.");
  };

  const handleClearKey = () => {
    Alert.alert(
      "Clear API key?",
      "AI features will stop working until a key is added.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await clearKey();
          },
        },
      ],
    );
  };

  const handleGetKey = () => {
    WebBrowser.openBrowserAsync("https://openrouter.ai/keys");
  };

  const handleModelBlur = () => {
    const v = modelInput.trim();
    if (v && v !== aiModel) setAiModel(v);
  };

  return (
    <>
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* AI Configuration */}
        <SectionHeader title="AI Configuration" />
        <Card>
          <View style={styles.apiHeader}>
            <Text style={[styles.apiLabel, { color: colors.onSurface }]}>
              API Key
            </Text>
            <Pressable hitSlop={8} onPress={handleGetKey}>
              <Text style={[styles.apiLink, { color: colors.primary }]}>
                Get your key
              </Text>
            </Pressable>
          </View>
          <View
            style={[
              styles.input,
              {
                borderColor: colors.outlineVariant,
                backgroundColor: colors.surfaceContainerHigh,
              },
            ]}
          >
            <TextInput
              value={keyInput}
              onChangeText={setKeyInput}
              placeholder="sk-or-v1-……"
              placeholderTextColor={colors.onSurfaceVariant}
              secureTextEntry={!keyVisible}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              style={[styles.inputText, { color: colors.onSurface }]}
            />
            <Pressable
              hitSlop={8}
              style={styles.inputIcon}
              onPress={() => setKeyVisible((v) => !v)}
            >
              <Ionicons
                name={keyVisible ? "eye-outline" : "eye-off-outline"}
                size={20}
                color={colors.onSurfaceVariant}
              />
            </Pressable>
            <Pressable
              hitSlop={8}
              style={styles.inputIcon}
              onPress={handlePaste}
            >
              <Ionicons
                name="clipboard-outline"
                size={20}
                color={colors.onSurfaceVariant}
              />
            </Pressable>
          </View>
          <Pressable
            onPress={handleValidate}
            disabled={validating}
            style={({ pressed }) => [
              styles.validateBtn,
              {
                backgroundColor: colors.primaryContainer,
                opacity: pressed || validating ? 0.85 : 1,
              },
            ]}
          >
            {validating ? (
              <ActivityIndicator color={colors.onPrimaryContainer} />
            ) : (
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color={colors.onPrimaryContainer}
              />
            )}
            <Text
              style={[
                styles.validateText,
                { color: colors.onPrimaryContainer },
              ]}
            >
              {validating ? "Validating…" : "Validate & Save"}
            </Text>
          </Pressable>
          {savedKey ? (
            <Pressable
              hitSlop={8}
              onPress={handleClearKey}
              style={styles.clearKey}
            >
              <Text style={[styles.clearKeyText, { color: colors.error }]}>
                Clear saved key
              </Text>
            </Pressable>
          ) : null}
        </Card>

        <Card>
          <View style={styles.modelBlock}>
            <Text style={[styles.modelLabel, { color: colors.onSurface }]}>
              AI Model
            </Text>
            <TextInput
              value={modelInput}
              onChangeText={setModelInput}
              onBlur={handleModelBlur}
              placeholder="provider/model"
              placeholderTextColor={colors.onSurfaceVariant}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              style={[
                styles.modelInput,
                {
                  color: colors.onSurface,
                  borderColor: colors.outlineVariant,
                  backgroundColor: colors.surfaceContainerHigh,
                },
              ]}
            />
            <Text
              style={[styles.modelHint, { color: colors.onSurfaceVariant }]}
            >
              Free models end with :free. See openrouter.ai/models
            </Text>
          </View>
        </Card>

        {/* Editor */}
        <SectionHeader title="Editor" />
        <Card>
          <Dropdown
            icon={
              <Ionicons name="code-slash" size={20} color={colors.onSurface} />
            }
            label="Default Language"
            value={language?.name ?? defaultLanguage}
            valueAsChip
            valueColor={language?.color}
            onPress={() => setPicker("language")}
          />
          <Divider style={styles.cardDivider} />
          <Dropdown
            icon={
              <MaterialIcons
                name="text-fields"
                size={20}
                color={colors.onSurface}
              />
            }
            label="Font Size"
            value={`${fontSize}px`}
            onPress={() => setPicker("fontSize")}
          />
        </Card>

        {/* Appearance */}
        <SectionHeader title="Appearance" />
        <Card>
          <Dropdown
            icon={
              <Ionicons
                name={isDarkMode ? "moon-outline" : "sunny-outline"}
                size={20}
                color={colors.onSurface}
              />
            }
            label="Theme"
            value={THEME_LABELS[themeMode]}
            onPress={() => setPicker("theme")}
          />
        </Card>

        {/* Data */}
        <SectionHeader title="Data" />
        <Card>
          <ActionRow
            icon={
              <Ionicons
                name="cloud-upload-outline"
                size={20}
                color={colors.onSurface}
              />
            }
            label="Export Snippets"
          />
          <Divider style={styles.cardDivider} />
          <ActionRow
            icon={
              <Ionicons
                name="download-outline"
                size={20}
                color={colors.onSurface}
              />
            }
            label="Import Snippets"
          />
          <Divider style={styles.cardDivider} />
          <ActionRow
            icon={
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            }
            label="Clear AI History"
            labelColor={colors.error}
          />
        </Card>

        {/* Footer */}
        <View style={styles.footer}>
          <MaterialIcons
            name="text-snippet"
            size={32}
            color={colors.primaryContainer}
          />
          <Text style={[styles.footerVersion, { color: colors.onSurface }]}>
            DevPad AI {APP_VERSION}
          </Text>
          <View style={styles.footerLinks}>
            <Text style={[styles.footerLink, { color: colors.primaryFixed }]}>
              Credits
            </Text>
            <Text
              style={[styles.footerDot, { color: colors.onSurfaceVariant }]}
            >
              ·
            </Text>
            <Text style={[styles.footerLink, { color: colors.primaryFixed }]}>
              Privacy
            </Text>
            <Text
              style={[styles.footerDot, { color: colors.onSurfaceVariant }]}
            >
              ·
            </Text>
            <Text style={[styles.footerLink, { color: colors.primaryFixed }]}>
              Terms
            </Text>
          </View>
        </View>
      </ScrollView>

      <PickerModal
        visible={picker === "theme"}
        title="Theme"
        options={themeOptions}
        selected={themeMode}
        onSelect={setThemeMode}
        onClose={() => setPicker(null)}
      />
      <PickerModal
        visible={picker === "language"}
        title="Default Language"
        options={languageOptions}
        selected={defaultLanguage}
        onSelect={setDefaultLanguage}
        onClose={() => setPicker(null)}
      />
      <PickerModal
        visible={picker === "fontSize"}
        title="Font Size"
        options={fontSizeOptions}
        selected={fontSize}
        onSelect={setFontSize}
        onClose={() => setPicker(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge,
  },

  // Inset divider used inside a Card
  cardDivider: {
    marginHorizontal: spacing.lg,
  },

  // API key block
  apiHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  apiLabel: {
    ...typography.bodyLg,
  },
  apiLink: {
    ...typography.bodyMd,
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  inputText: {
    flex: 1,
    ...typography.codeBlock,
    paddingVertical: spacing.xs,
  },
  inputIcon: {
    paddingHorizontal: 2,
  },
  validateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  validateText: {
    ...typography.labelCaps,
    fontSize: 13,
  },
  clearKey: {
    alignSelf: "center",
    paddingVertical: spacing.sm,
  },
  clearKeyText: {
    ...typography.bodyMd,
  },

  // AI model block
  modelBlock: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  modelLabel: {
    ...typography.bodyLg,
  },
  modelInput: {
    ...typography.codeBlock,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  modelHint: {
    ...typography.bodyMd,
  },

  // Footer
  footer: {
    alignItems: "center",
    marginTop: spacing.xxl,
    gap: spacing.sm,
  },
  footerVersion: {
    ...typography.labelCaps,
    fontSize: 13,
  },
  footerLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  footerLink: {
    ...typography.bodyMd,
  },
  footerDot: {
    ...typography.bodyMd,
  },
});

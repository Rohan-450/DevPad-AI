import CodeEditor from "@/components/core/CodeEditor";
import { radius, spacing, typography } from "@/constants";
import { useTheme } from "@/context/theme";
import { useFileText } from "@/hooks/useAttachments";
import { isTextFileName, languageFromFileName } from "@/lib/language";
import { shareFile } from "@/services/files";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type FileContentViewProps = {
  uri: string;
  name?: string;
};

const FileContentView = ({ uri, name }: FileContentViewProps) => {
  const { colors } = useTheme();
  const readable = isTextFileName(name ?? "");
  const { data, isLoading } = useFileText(readable ? uri : null);

  // Non-text files (pdf, doc, …) can't render in-app — hand them to a
  // compatible app via the system sheet.
  if (!readable) {
    return (
      <View style={styles.center}>
        <Ionicons name="document-outline" size={56} color="rgba(255,255,255,0.5)" />
        <Text style={styles.message}>
          {name ?? "This file"} can&apos;t be previewed here.
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.openBtn,
            {
              backgroundColor: colors.primaryContainer,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
          onPress={() => shareFile(uri)}
        >
          <Ionicons
            name="open-outline"
            size={18}
            color={colors.onPrimaryContainer}
          />
          <Text style={[styles.openText, { color: colors.onPrimaryContainer }]}>
            Open in app
          </Text>
        </Pressable>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <CodeEditor
        value={data ?? ""}
        language={languageFromFileName(name ?? "")}
        mode="read"
        showLineNumbers
        fontSize={13}
      />
    </ScrollView>
  );
};

export default FileContentView;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  message: {
    ...typography.bodyLg,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  openBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
  },
  openText: {
    ...typography.bodyLg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
});

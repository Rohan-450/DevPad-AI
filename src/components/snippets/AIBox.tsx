import { radius, spacing, typography } from "@/constants";
import { useTheme } from "@/context/theme";
import { useGenerate } from "@/hooks/useAi";
import { isAiError } from "@/services/ai";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  // Optional — on the create form there's no saved snippet yet. When omitted
  // the box renders a placeholder prompting the user to save first.
  snippet?: Snippet;
  onGenerated?: () => void;
};

const ACTIONS: {
  kind: AiKind;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}[] = [
  { kind: "explain", icon: "information-circle-outline", label: "Explain" },
  { kind: "improve", icon: "flash-outline", label: "Improve" },
];

const AIBox = ({ snippet, onGenerated }: Props) => {
  const { colors } = useTheme();
  const router = useRouter();
  const { mutate, isPending } = useGenerate();

  const handleError = (err: unknown) => {
    if (!isAiError(err)) {
      // Surface the real message — DB errors, unexpected JS exceptions, etc.
      const msg = err instanceof Error ? err.message : String(err);
      Alert.alert("AI request failed", msg || "Please try again.");
      return;
    }
    if (err.code === "MISSING_KEY") {
      Alert.alert(
        "API key required",
        "Add your OpenRouter API key in Settings to use AI features.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => router.push("/settings") },
        ],
      );
      return;
    }
    if (err.code === "NETWORK_ERROR") {
      Alert.alert("Offline", "AI features need an internet connection.");
      return;
    }
    if (err.code === "INVALID_RESPONSE") {
      Alert.alert("Unexpected response", err.message);
      return;
    }
    Alert.alert("AI provider error", err.message);
  };

  const trigger = (kind: AiKind) => {
    if (!snippet) return;
    mutate(
      { snippet, kind },
      {
        onSuccess: () => onGenerated?.(),
        onError: handleError,
      },
    );
  };

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
        <Ionicons
          style={{ position: "relative", bottom: 2 }}
          name="sparkles"
          size={20}
          color={colors.warning}
        />
        <Text style={[styles.title, { color: colors.onSurface }]}>Ask AI</Text>
      </View>

      {!snippet ? (
        <View style={styles.placeholder}>
          <Text
            style={[styles.placeholderText, { color: colors.onSurfaceVariant }]}
          >
            Save the snippet to ask AI.
          </Text>
        </View>
      ) : isPending ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.primary} />
          <Text
            style={[styles.loadingText, { color: colors.onSurfaceVariant }]}
          >
            Generating…
          </Text>
        </View>
      ) : (
        <View style={{ flex: 1, justifyContent: "flex-end", gap: spacing.sm }}>
          {ACTIONS.map((a) => (
            <Pressable
              key={a.kind}
              onPress={() => trigger(a.kind)}
              disabled={isPending}
              style={({ pressed }) => [
                styles.action,
                {
                  backgroundColor: colors.surfaceContainerHigh,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Ionicons name={a.icon} size={16} color={colors.onSurface} />
              <Text style={[styles.actionLabel, { color: colors.onSurface }]}>
                {a.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};

export default AIBox;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  title: {
    ...typography.headlineMd,
    marginBottom: spacing.xs,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  actionLabel: {
    ...typography.bodyMd,
  },
  loadingRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  loadingText: {
    ...typography.bodyMd,
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  placeholderText: {
    ...typography.bodyMd,
    textAlign: "center",
  },
});

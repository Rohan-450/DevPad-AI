import SnippetForm, {
    type SnippetFormValues,
} from "@/components/snippets/SnippetForm";
import { typography } from "@/constants";
import { useTheme } from "@/context/theme";
import { useSnippet, useUpdateSnippet } from "@/hooks/useSnippets";
import { useSnippetTags } from "@/hooks/useTags";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function EditSnippet() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: snippet, isLoading } = useSnippet(id);
  const { data: tags, isLoading: tagsLoading } = useSnippetTags(id);
  const { mutateAsync: update, isPending } = useUpdateSnippet();

  if (isLoading || tagsLoading) {
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

  const handleSubmit = async (values: SnippetFormValues) => {
    await update({ id: snippet.id, ...values });
    router.back();
  };

  return (
    <SnippetForm
      headerTitle="Edit Snippet"
      initialValues={{
        title: snippet.title,
        code: snippet.code,
        language: snippet.language,
        isFavorite: snippet.isFavorite,
        tags: tags ?? [],
      }}
      submitting={isPending}
      onSubmit={handleSubmit}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  missing: {
    ...typography.bodyLg,
  },
});

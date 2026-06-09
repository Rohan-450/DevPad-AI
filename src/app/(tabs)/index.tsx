import EmptyState from "@/components/shared/EmptyState";
import LanguageTabs, {
  ALL_LANGUAGES,
} from "@/components/snippets/LanguageTabs";
import SnippetCard from "@/components/snippets/SnippetCard";
import { spacing, typography } from "@/constants";
import { useTheme } from "@/context/theme";
import { useSnippets } from "@/hooks/useSnippets";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";

export default function Home() {
  const { colors } = useTheme();
  const router = useRouter();
  const [selected, setSelected] = useState(ALL_LANGUAGES);

  const isAll = selected === ALL_LANGUAGES;
  const { data: snippets = [], isLoading } = useSnippets(
    isAll ? {} : { language: selected },
  );

  // A specific language can only be picked from the tabs, which means data
  // exists — so keep the tabs visible even when that language has no results.
  const showList = snippets.length > 0 || !isAll;

  if (isLoading && isAll) {
    return (
      <View
        style={[styles.container, styles.center, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!showList) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="code-slash-outline"
          title="No snippets yet"
          description="Save your first code snippet and it'll show up here."
          actionLabel="New Snippet"
          onAction={() => router.push("/snippets/new")}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.onSurface }]}>
        My Snippets
      </Text>
      <LanguageTabs selected={selected} onSelect={setSelected} />
      <FlatList
        data={snippets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SnippetCard
            snippet={item}
            onPress={() =>
              router.push({
                pathname: "/snippets/[id]",
                params: { id: item.id },
              })
            }
          />
        )}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <EmptyState
              icon="search-outline"
              title="No matches"
              description="No snippets for this language yet."
            />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    ...typography.headlineLg,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge,
  },
  separator: {
    height: spacing.md,
  },
});

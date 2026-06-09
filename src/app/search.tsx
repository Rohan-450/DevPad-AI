import EmptyState from "@/components/shared/EmptyState";
import LanguageTabs, {
    ALL_LANGUAGES,
} from "@/components/snippets/LanguageTabs";
import SnippetCard from "@/components/snippets/SnippetCard";
import { radius, spacing, typography } from "@/constants";
import { useTheme } from "@/context/theme";
import { useSnippets } from "@/hooks/useSnippets";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Search = () => {
  const { colors, isDarkMode } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState(ALL_LANGUAGES);

  const trimmed = query.trim();
  const isAllLanguages = language === ALL_LANGUAGES;
  // Search only kicks in once the user actually narrows things down — a query
  // and/or a specific language. With no filter we show the prompt, not results.
  const hasFilter = trimmed.length > 0 || !isAllLanguages;

  const { data: snippets = [], isFetching } = useSnippets(
    hasFilter
      ? {
          search: trimmed || undefined,
          language: isAllLanguages ? undefined : language,
        }
      : {},
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header — back + title */}
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
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>
          Search
        </Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.surfaceContainer,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.onSurfaceVariant} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by title or code"
            placeholderTextColor={colors.onSurfaceVariant}
            style={[styles.input, { color: colors.onSurface }]}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <Pressable hitSlop={8} onPress={() => setQuery("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.onSurfaceVariant}
              />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Language filter */}
      <LanguageTabs selected={language} onSelect={setLanguage} />

      {/* Results / empty states */}
      {!hasFilter ? (
        <EmptyState
          icon="search-outline"
          title="Search snippets"
          description="Type to search by title or code, or pick a language to filter."
        />
      ) : (
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
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          ListEmptyComponent={
            isFetching ? (
              <View style={styles.center}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : (
              <EmptyState
                icon="file-tray-outline"
                title="No results"
                description="No snippets match your filters. Try a different search or language."
              />
            )
          }
        />
      )}
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    ...typography.headlineMd,
  },

  // Search bar
  searchWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    height: 48,
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    ...typography.bodyLg,
    padding: 0,
  },

  // List
  listContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge,
  },
  separator: {
    height: spacing.md,
  },
});

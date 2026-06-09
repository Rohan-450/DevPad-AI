import EmptyState from "@/components/shared/EmptyState";
import LanguageTabs, {
    ALL_LANGUAGES,
} from "@/components/snippets/LanguageTabs";
import SnippetCard from "@/components/snippets/SnippetCard";
import { spacing } from "@/constants";
import { useTheme } from "@/context/theme";
import { useSnippets } from "@/hooks/useSnippets";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";

export default function Favorites() {
  const { colors } = useTheme();
  const router = useRouter();
  const [selected, setSelected] = useState(ALL_LANGUAGES);

  const isAll = selected === ALL_LANGUAGES;
  const { data: favorites = [], isLoading } = useSnippets({
    favoritesOnly: true,
    ...(isAll ? {} : { language: selected }),
  });

  // A specific language can only be picked from the tabs, which means data
  // exists — so keep the tabs visible even when that language has no results.
  const showList = favorites.length > 0 || !isAll;

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
          icon="star-outline"
          title="No favorites yet"
          description="Tap the star on a snippet to keep it here."
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LanguageTabs selected={selected} onSelect={setSelected} />
      <FlatList
        data={favorites}
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
              description="No favorites for this language yet."
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
